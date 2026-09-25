"""
File signature ("magic bytes") database used for raw carving.

Each entry:
    name: (header_bytes_list, footer_bytes_or_None, max_size_bytes)

- header_bytes_list: one or more possible start-of-file byte sequences
- footer_bytes_or_None: end-of-file marker to search for. If None, the
  carver falls back to a max_size cutoff (used for formats without a
  reliable end marker, e.g. many container/archive formats).
- max_size_bytes: hard safety cap so a missing footer can't cause the
  carver to read gigabytes into a single "recovered" file.
"""

SIGNATURES = {
    "jpg": {
        "headers": [b"\xff\xd8\xff\xe0", b"\xff\xd8\xff\xe1", b"\xff\xd8\xff\xdb"],
        "footer": b"\xff\xd9",
        "max_size": 50 * 1024 * 1024,
    },
    "png": {
        "headers": [b"\x89PNG\r\n\x1a\n"],
        "footer": b"IEND\xaeB`\x82",
        "max_size": 50 * 1024 * 1024,
    },
    "gif": {
        "headers": [b"GIF87a", b"GIF89a"],
        "footer": b"\x00\x3b",
        "max_size": 20 * 1024 * 1024,
    },
    "pdf": {
        "headers": [b"%PDF-"],
        "footer": b"%%EOF",
        "max_size": 200 * 1024 * 1024,
    },
    "zip": {
        # Also matches docx/xlsx/pptx/jar/apk (all are zip containers)
        "headers": [b"PK\x03\x04"],
        "footer": b"PK\x05\x06",  # end-of-central-directory record
        "footer_padding": 22,     # EOCD record is 22 bytes, footer marks its start
        "max_size": 500 * 1024 * 1024,
    },
    "gzip": {
        "headers": [b"\x1f\x8b\x08"],
        "footer": None,
        "max_size": 500 * 1024 * 1024,
    },
    "bmp": {
        "headers": [b"BM"],
        "footer": None,
        "max_size": 50 * 1024 * 1024,
    },
    "mp4": {
        "headers": [b"\x00\x00\x00\x18ftyp", b"\x00\x00\x00\x20ftyp"],
        "footer": None,
        "max_size": 2 * 1024 * 1024 * 1024,
    },
    "sqlite": {
        "headers": [b"SQLite format 3\x00"],
        "footer": None,
        "max_size": 500 * 1024 * 1024,
    },
    "wav": {
        "headers": [b"RIFF"],
        "footer": None,
        "max_size": 200 * 1024 * 1024,
    },
}
