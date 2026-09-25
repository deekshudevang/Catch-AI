"""
Command-line interface for deep-recover.

Typical workflow:
    1. Image the source device first (see README) -- never run this
       tool against a live device you care about.
    2. Run metadata recovery against the image (fast, accurate, gets
       real filenames -- works when the filesystem structures are intact).
    3. Run carving as well (slower, no filenames, but finds content even
       when the filesystem index itself has been damaged/reformatted).
"""

from __future__ import annotations

import argparse
import logging
import sys
import time

from .carver import Carver
from .metadata_recovery import MetadataRecovery, HAVE_PYTSK3
from .signatures import SIGNATURES


def _progress_printer(label: str):
    start = time.time()

    def cb(done, total):
        pct = (done / total) * 100 if total else 0
        elapsed = time.time() - start
        rate = (done / (1024 * 1024)) / elapsed if elapsed > 0 else 0
        sys.stdout.write(
            f"\r{label}: {pct:5.1f}%  ({done // (1024*1024)} MB / {total // (1024*1024)} MB)  "
            f"{rate:5.1f} MB/s"
        )
        sys.stdout.flush()
    return cb


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="deep-recover",
        description="Recover deleted files from a disk image via filesystem "
                    "metadata and/or raw signature carving.",
    )
    p.add_argument("source", help="Path to the disk image or device file "
                                  "(e.g. an image made with dd, not a live device)")
    p.add_argument("-o", "--output", default="./recovered",
                   help="Directory to write recovered files to (default: ./recovered)")
    p.add_argument("--mode", choices=["auto", "metadata", "carve"], default="auto",
                   help="auto: try metadata recovery first, then carve as well. "
                        "metadata: filesystem-metadata recovery only (requires pytsk3). "
                        "carve: raw signature carving only.")
    p.add_argument("--types", nargs="+", choices=list(SIGNATURES.keys()),
                   help="Limit carving to these file types (default: all supported types)")
    p.add_argument("--offset", type=int, default=0,
                   help="Byte offset of the partition inside the image, if the image "
                        "is a whole-disk image rather than a single partition (default: 0)")
    p.add_argument("-v", "--verbose", action="store_true", help="Verbose logging")
    return p


def run_metadata(source: str, output: str, offset: int) -> bool:
    if not HAVE_PYTSK3:
        print("[metadata] pytsk3 not installed -- skipping metadata-based recovery.")
        print("[metadata] Install with: pip install pytsk3")
        return False
    try:
        mr = MetadataRecovery(source, output, offset=offset)
    except Exception as exc:
        print(f"[metadata] Could not open filesystem: {exc}")
        return False

    deleted = mr.list_deleted("/")
    print(f"[metadata] Found {len(deleted)} deleted-but-intact file entries.")
    for entry in deleted:
        mr.recover_entry(entry)
    return True


def run_carve(source: str, output: str, types) -> None:
    carver = Carver(source, output, file_types=types)
    print(f"[carve] Scanning {source} for file signatures"
          f"{' (' + ', '.join(types) + ')' if types else ''} ...")
    results, stats = carver.carve(progress_cb=_progress_printer("[carve]"))
    print()  # newline after progress bar
    print(f"[carve] Scanned {stats.bytes_scanned // (1024*1024)} MB, "
          f"found {stats.files_found} files:")
    for ftype, count in sorted(stats.by_type.items()):
        print(f"           {ftype:8s}: {count}")


def main(argv=None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.WARNING,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    )

    print(f"deep-recover -- source: {args.source}")
    print(f"Output directory: {args.output}\n")

    did_metadata = False
    if args.mode in ("auto", "metadata"):
        did_metadata = run_metadata(args.source, args.output, args.offset)

    if args.mode == "metadata" and not did_metadata:
        print("Metadata recovery unavailable and no fallback requested. Exiting.")
        return 1

    if args.mode == "carve" or args.mode == "auto":
        run_carve(args.source, args.output, args.types)

    print("\nDone.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
