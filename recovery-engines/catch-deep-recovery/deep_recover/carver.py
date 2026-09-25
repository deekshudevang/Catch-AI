"""
Streaming signature-based carver.

Works directly on raw bytes: a disk device, a dd image, a memory card dump,
whatever. It never assumes a filesystem is present or intact, which is what
makes it usable as a last resort when metadata-based recovery (see
metadata_recovery.py) finds nothing.

Design notes:
- Reads in fixed-size chunks (default 8 MB) instead of loading the whole
  source into RAM. A USB stick image can be tens of GB; a naive
  `data = f.read()` will not scale.
- Keeps a small overlap window between chunks so a signature that happens
  to straddle a chunk boundary is not missed.
- Streams matched regions straight to disk rather than buffering whole
  files in memory, since recovered files (esp. video) can be large.
"""

from __future__ import annotations

import hashlib
import logging
import os
from dataclasses import dataclass, field
from typing import BinaryIO, Iterator

from .signatures import SIGNATURES

logger = logging.getLogger("deep_recover.carver")

CHUNK_SIZE = 8 * 1024 * 1024   # 8 MB read window
OVERLAP = 4096                  # must be >= longest header/footer length


@dataclass
class CarvedFile:
    file_type: str
    start_offset: int
    end_offset: int
    output_path: str
    size: int
    sha256: str


@dataclass
class CarveStats:
    bytes_scanned: int = 0
    files_found: int = 0
    by_type: dict = field(default_factory=dict)


class Carver:
    def __init__(self, source_path: str, output_dir: str, file_types: list[str] | None = None,
                 chunk_size: int = CHUNK_SIZE, dedupe: bool = True):
        self.source_path = source_path
        self.output_dir = output_dir
        self.chunk_size = chunk_size
        self.dedupe = dedupe
        self.file_types = file_types or list(SIGNATURES.keys())
        self.signatures = {k: v for k, v in SIGNATURES.items() if k in self.file_types}
        self._seen_hashes: set[str] = set()
        os.makedirs(self.output_dir, exist_ok=True)

    def _source_size(self) -> int | None:
        try:
            return os.path.getsize(self.source_path)
        except OSError:
            # block devices often don't report a normal size via getsize
            return None

    def carve(self, progress_cb=None) -> tuple[list[CarvedFile], CarveStats]:
        results: list[CarvedFile] = []
        stats = CarveStats()
        total_size = self._source_size()

        with open(self.source_path, "rb") as src:
            buffer = b""
            base_offset = 0
            counters: dict[str, int] = {}

            while True:
                chunk = src.read(self.chunk_size)
                if not chunk:
                    break
                buffer = buffer[-OVERLAP:] if buffer else b""
                window_start = base_offset - len(buffer)
                buffer += chunk
                stats.bytes_scanned += len(chunk)
                base_offset += len(chunk)

                self._scan_window(buffer, window_start, results, stats, counters)

                if progress_cb and total_size:
                    progress_cb(min(stats.bytes_scanned, total_size), total_size)

        return results, stats

    def _scan_window(self, buffer: bytes, window_start: int, results, stats, counters):
        for ftype, spec in self.signatures.items():
            for header in spec["headers"]:
                idx = 0
                while True:
                    pos = buffer.find(header, idx)
                    if pos == -1:
                        break
                    idx = pos + 1
                    abs_start = window_start + pos
                    carved = self._extract_one(ftype, spec, header, abs_start)
                    if carved is None:
                        continue
                    if self.dedupe and carved.sha256 in self._seen_hashes:
                        os.remove(carved.output_path)
                        continue
                    self._seen_hashes.add(carved.sha256)
                    counters[ftype] = counters.get(ftype, 0) + 1
                    stats.files_found += 1
                    stats.by_type[ftype] = stats.by_type.get(ftype, 0) + 1
                    results.append(carved)
                    logger.info("Recovered %s (%d bytes) -> %s",
                                ftype, carved.size, carved.output_path)

    def _extract_one(self, ftype: str, spec: dict, header: bytes, abs_start: int) -> CarvedFile | None:
        """Re-open the source at abs_start and read forward until the footer
        (or max_size) is found. Re-opening per-hit keeps memory flat and
        avoids re-deriving offsets from the sliding window buffer."""
        max_size = spec["max_size"]
        footer = spec.get("footer")
        footer_padding = spec.get("footer_padding", len(footer) if footer else 0)

        with open(self.source_path, "rb") as src:
            src.seek(abs_start)
            remaining = max_size
            read_buf = b""
            end_found_at = None
            block = 1024 * 1024
            total_read = 0

            while remaining > 0:
                to_read = min(block, remaining)
                data = src.read(to_read)
                if not data:
                    break
                read_buf += data
                total_read += len(data)
                remaining -= len(data)

                if footer:
                    fpos = read_buf.find(footer)
                    if fpos != -1:
                        end_found_at = fpos + footer_padding
                        break
                else:
                    # No reliable footer: cut at max_size (safety cap)
                    if total_read >= max_size:
                        end_found_at = max_size
                        break

                # keep buffer from growing unbounded when footer is absent for a long time
                if len(read_buf) > max_size:
                    end_found_at = max_size
                    break

            if end_found_at is None:
                end_found_at = len(read_buf)  # source ended before footer/cap

            payload = read_buf[:end_found_at]

        if len(payload) < len(header):
            return None

        sha256 = hashlib.sha256(payload).hexdigest()
        out_name = f"{ftype}_{abs_start:012d}_{sha256[:8]}.{ftype}"
        out_path = os.path.join(self.output_dir, out_name)
        with open(out_path, "wb") as out:
            out.write(payload)

        return CarvedFile(
            file_type=ftype,
            start_offset=abs_start,
            end_offset=abs_start + len(payload),
            output_path=out_path,
            size=len(payload),
            sha256=sha256,
        )
