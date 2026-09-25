"""
Filesystem-metadata-based recovery.

Unlike carver.py (which ignores the filesystem entirely and just scans raw
bytes for magic numbers), this module walks the actual filesystem structures
-- the MFT on NTFS, the inode table on ext2/3/4, the FAT/directory entries on
FAT32/exFAT -- looking for entries still marked "deleted" whose data blocks
haven't been reused yet.

When it works, it's strictly better than carving: you get the real filename,
the real size, the real timestamps, and correctly reconstructed content even
for fragmented files -- carving can't do any of that, it just guesses.

Requires `pytsk3` (a Python binding for The Sleuth Kit). This is an optional
dependency; if it isn't installed, the CLI simply skips this pass and falls
back to carving alone.
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass

logger = logging.getLogger("deep_recover.metadata")

try:
    import pytsk3
    HAVE_PYTSK3 = True
except ImportError:
    HAVE_PYTSK3 = False


@dataclass
class RecoveredEntry:
    name: str
    inode: int
    size: int
    output_path: str
    deleted: bool


class MetadataRecovery:
    def __init__(self, image_path: str, output_dir: str, offset: int = 0):
        if not HAVE_PYTSK3:
            raise RuntimeError(
                "pytsk3 is not installed. Install it with:\n"
                "    pip install pytsk3\n"
                "(requires libtsk / build tools on some systems -- see README)"
            )
        self.image_path = image_path
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        self.img = pytsk3.Img_Info(image_path)
        # offset in sectors*512 for partitions inside a full-disk image; 0 for
        # an image of a single partition.
        self.fs = pytsk3.FS_Info(self.img, offset=offset)

    def list_deleted(self, path: str = "/") -> list[RecoveredEntry]:
        """Walk a directory recursively, returning every entry whose metadata
        is still present but flagged unallocated (i.e. deleted-but-intact)."""
        found: list[RecoveredEntry] = []
        self._walk(path, found)
        return found

    def _walk(self, path: str, found: list[RecoveredEntry], _seen=None):
        _seen = _seen or set()
        try:
            directory = self.fs.open_dir(path=path)
        except Exception as exc:
            logger.warning("Could not open directory %s: %s", path, exc)
            return

        for entry in directory:
            try:
                name = entry.info.name.name.decode("utf-8", errors="ignore")
            except Exception:
                continue
            if name in (".", ".."):
                continue
            if not entry.info.meta:
                continue

            is_deleted = bool(entry.info.meta.flags & pytsk3.TSK_FS_META_FLAG_UNALLOC)
            is_dir = entry.info.meta.type == pytsk3.TSK_FS_META_TYPE_DIR

            if is_dir and not is_deleted:
                # only recurse into directories that still exist; recursing
                # into deleted directory metadata is unreliable and risks
                # infinite loops on corrupted structures.
                child_path = f"{path.rstrip('/')}/{name}"
                key = (child_path, entry.info.meta.addr)
                if key not in _seen:
                    _seen.add(key)
                    self._walk(child_path, found, _seen)
                continue

            if is_deleted and entry.info.meta.type == pytsk3.TSK_FS_META_TYPE_REG:
                found.append(RecoveredEntry(
                    name=name,
                    inode=entry.info.meta.addr,
                    size=entry.info.meta.size,
                    output_path="",
                    deleted=True,
                ))

        return found

    def recover_entry(self, entry: RecoveredEntry) -> RecoveredEntry:
        """Read a deleted entry's data blocks off disk and write them out.
        If the blocks have already been overwritten this will produce a
        corrupt or short file -- that's the disk telling you it's gone,
        not a bug in this code."""
        f = self.fs.open_meta(inode=entry.inode)
        size = entry.size
        safe_name = "".join(c for c in entry.name if c.isalnum() or c in "._-") or "unnamed"
        out_path = os.path.join(self.output_dir, f"{entry.inode}_{safe_name}")

        offset = 0
        block = 1024 * 1024
        with open(out_path, "wb") as out:
            while offset < size:
                to_read = min(block, size - offset)
                try:
                    data = f.read_random(offset, to_read)
                except OSError:
                    logger.warning(
                        "Read error on inode %s at offset %d -- blocks likely "
                        "reallocated/overwritten. Output will be truncated.",
                        entry.inode, offset,
                    )
                    break
                if not data:
                    break
                out.write(data)
                offset += len(data)

        entry.output_path = out_path
        logger.info("Recovered '%s' (inode %d, %d bytes) -> %s",
                     entry.name, entry.inode, offset, out_path)
        return entry
