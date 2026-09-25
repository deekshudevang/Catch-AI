# deep-recover

Recover deleted files from disk images (USB sticks, SD cards, hard drive images) using two complementary engines:

1. **Metadata recovery** — parses the actual filesystem structures (FAT directory entries, NTFS MFT, ext2/3/4 inode table) via [`pytsk3`](https://github.com/py4n6/pytsk) to find entries still marked "deleted" whose data hasn't been overwritten yet. Gives you the real filename, size, and timestamps.
2. **Signature carving** — scans raw bytes for file "magic numbers" (`carver.py`), independent of any filesystem metadata. Works even if the filesystem index is damaged or the drive was reformatted, at the cost of losing filenames and sometimes exact file boundaries.

`deep-recover` runs both by default and de-duplicates results by content hash.

> ⚠️ **This tool only works on data that hasn't been overwritten.** "Delete" in almost every filesystem just removes the pointer to a file — the data itself stays on disk until something else reuses that space. See [How this works](#how-this-works) below. On SSDs with `TRIM` enabled, that window can close within seconds of deletion — see [Limitations](#limitations).

## Legal / ethical use

Only run this against media you **own** or have **explicit written authorization** to examine (e.g. your own USB stick, a drive you're contracted to investigate). Recovering data from a device you don't have the right to access is illegal in most jurisdictions, full stop. This tool does not defeat encryption, does not touch remote/network systems, and does not do anything a live human forensic examiner couldn't do by hand with a hex editor — it just automates it.

## Installation

[![PyPI](https://img.shields.io/pypi/v/deep-recover)](https://pypi.org/project/deep-recover/)

**From PyPI (recommended):**

```bash
pip install deep-recover
```

This installs the CLI with the signature-carving engine ready to go. To also get the filesystem-metadata engine (recommended — more accurate, recovers real filenames):

```bash
pip install deep-recover[metadata]
```

`pytsk3` (the metadata engine's dependency) needs build tools on some systems:

```bash
sudo apt install build-essential python3-dev libtsk-dev
pip install deep-recover[metadata]
```

If `pytsk3` fails to install, `deep-recover` still works — it just falls back to carving-only mode automatically.

**From source (for development):**

```bash
git clone https://github.com/Bernard411/deep-recover.git
cd deep-recover
pip install -e .[metadata] --break-system-packages   # Kali/Debian externally-managed envs
```

## Quick start

**Step 1 — never run this against a live device.** Image it first:

```bash
lsblk                      # find your USB stick, e.g. /dev/sdb
sudo umount /dev/sdb1       # unmount, don't format
sudo dd if=/dev/sdb of=usb_image.dd bs=4M status=progress
```

**Step 2 — run deep-recover against the image, not the device:**

```bash
deep-recover usb_image.dd -o ./recovered
```

Output:

```
deep-recover -- source: usb_image.dd
Output directory: ./recovered

[metadata] Found 3 deleted-but-intact file entries.
[carve] Scanning usb_image.dd for file signatures ...
[carve] Scanned 64 MB, found 2 files:
           pdf     : 1
           png     : 1

Done.
```

Recovered files land in `./recovered/`, named either after their original filename (metadata engine) or `<type>_<offset>_<hash8>.<ext>` (carving engine).

## Usage

```
deep-recover SOURCE [-o OUTPUT] [--mode {auto,metadata,carve}] [--types TYPE [TYPE ...]] [--offset BYTES] [-v]
```

| Flag | Description |
|---|---|
| `source` | Path to a disk **image** (from `dd`) or image file. Not a live mounted device. |
| `-o, --output` | Directory for recovered files (default `./recovered`) |
| `--mode` | `auto` (default, both engines), `metadata` (filesystem-aware only), `carve` (raw signature scan only) |
| `--types` | Restrict carving to specific formats, e.g. `--types jpg png pdf` |
| `--offset` | Byte offset of the partition inside the image — needed if you imaged a **whole disk** (with a partition table) rather than a single partition. Use `fdisk -l usb_image.dd` to find the partition start sector, then multiply by 512. |
| `-v, --verbose` | Debug-level logging of every recovered file as it's found |

Supported carve types: `jpg, png, gif, pdf, zip` (also matches docx/xlsx/pptx/apk/jar, since they're zip containers), `gzip, bmp, mp4, sqlite, wav`. Add more in `deep_recover/signatures.py`.

**More examples:**

```bash
# Only carve for photos, skip everything else
deep-recover usb_image.dd -o ./recovered --types jpg png

# Only run the filesystem-metadata engine (fast, real filenames, needs pytsk3)
deep-recover usb_image.dd -o ./recovered --mode metadata

# Only carve, skip metadata parsing entirely (e.g. filesystem is too damaged to mount)
deep-recover usb_image.dd -o ./recovered --mode carve

# Whole-disk image with a partition table: recover partition 1 starting at sector 2048
deep-recover full_disk.dd -o ./recovered --offset $((2048 * 512))

# Verbose logging -- see every file as it's found, not just the summary
deep-recover usb_image.dd -o ./recovered -v
```

## How this works

### Why "delete" doesn't delete

Deleting a file removes its directory/index entry (and, on FAT, flips the first byte of the filename) and marks its data blocks as reusable. The actual bytes stay on disk untouched until the OS writes something else into that space. This is why recovery is possible at all — and why **the less you use the drive after deleting something, the better your odds.**

### Metadata engine (`metadata_recovery.py`)

Walks the filesystem's own bookkeeping structures looking for entries flagged deleted-but-present (`TSK_FS_META_FLAG_UNALLOC` in Sleuth Kit terms). If the data blocks those entries point to are still intact, it reads them back in original size/order — correctly handling fragmentation, which carving cannot do. This is the accurate, "proper forensics" path, and it's tried first.

### Carving engine (`carver.py`)

Ignores the filesystem entirely and scans raw bytes for known file signatures (`FF D8 FF` for JPEG, `%PDF-` for PDF, etc.), reading forward from each match to a known end-marker or a safety size cap. This is the fallback for cases where the filesystem index itself is gone (quick-formatted drive, corrupted table) — at the cost of no filenames, and occasional corruption if a file was fragmented across non-contiguous blocks.

It streams the source in 8 MB chunks with a small overlap window rather than loading the whole image into memory, so it scales to full-disk images, not just small USB sticks.

## Limitations

- **SSDs + TRIM.** Modern SSDs (and most modern OSes) issue a `TRIM` command shortly after deletion that tells the drive to actually erase those blocks at the hardware level for wear-leveling. Once that's happened, no software — this tool, `photorec`, `testdisk`, anything — can recover the data. This mostly affects internal SSDs; most USB flash drives and SD cards do not implement TRIM, so recovery odds there are much better.
- **Overwritten blocks** produce partial/corrupt output, not an error — check file integrity after recovery.
- **Carving fragmented files** (a file split across non-contiguous disk regions) will produce corrupted output for formats without a reliable end marker. The metadata engine handles fragmentation correctly when it's available; carving is a last resort for exactly this reason.
- **Encrypted volumes**: if the disk was encrypted (LUKS, BitLocker, FileVault) and you don't have the key, recovered "data" is unreadable ciphertext — this tool doesn't and won't attempt to break encryption.

## Comparison to existing tools

`deep-recover` is a learning/utility project, not a replacement for mature tools. For production forensic work also consider:

- [`photorec`](https://www.cgsecurity.org/wiki/PhotoRec) / [`testdisk`](https://www.cgsecurity.org/wiki/TestDisk) — mature, battle-tested carving, more supported formats
- [The Sleuth Kit](https://www.sleuthkit.org/sleuthkit/) / [Autopsy](https://www.autopsy.com/) — the full-featured version of what `metadata_recovery.py` does here, with a GUI and case management

## Project layout

```
deep_recover/
  __init__.py
  signatures.py          # file signature database
  carver.py              # raw signature-carving engine
  metadata_recovery.py   # pytsk3-based filesystem-metadata engine
  cli.py                 # command-line entry point
requirements.txt
setup.py
README.md
```

## License

MIT — see `LICENSE`.