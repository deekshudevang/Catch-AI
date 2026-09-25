import hashlib
from pathlib import Path

SIGNATURES = (
    (b"%PDF-", "PDF"),
    (b"\xff\xd8\xff", "JPEG"),
    (b"\x89PNG\r\n\x1a\n", "PNG"),
    (b"PK\x03\x04", "ZIP"),
)

def validate_reconstruction(file_path: str) -> dict:
    path = Path(file_path)
    if not path.exists():
        return {"status": "INVALID", "reasons": ["File not found"]}
    data = path.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    if not data:
        return {"status": "INVALID", "file_type": "UNKNOWN", "size_bytes": 0, "sha256": digest, "reasons": ["Empty file"]}

    kind = next((name for sig, name in SIGNATURES if data.startswith(sig)), "UNKNOWN")
    valid = False
    reason = "Unknown file type; no structural validator is available"

    if kind == "PNG":
        valid = data.endswith(b"IEND\xaeB\x60\x82")
        reason = "Passed PNG signature and IEND validation" if valid else "Missing PNG IEND marker"
    elif kind == "JPEG":
        valid = data.endswith(b"\xff\xd9")
        reason = "Passed JPEG SOI/EOI validation" if valid else "Missing JPEG EOI marker"
    elif kind == "PDF":
        valid = b"%%EOF" in data[-1024:]
        reason = "Passed PDF header and EOF validation" if valid else "Missing PDF EOF marker near file end"
    elif kind == "ZIP":
        valid = b"PK\x05\x06" in data[-(22 + 65535):]
        reason = "Passed ZIP signature and EOCD validation" if valid else "Missing ZIP end-of-central-directory record"

    return {
        "magic_bytes_valid": kind != "UNKNOWN",
        "file_type": kind,
        "size_bytes": len(data),
        "sha256": digest,
        "status": "VALID" if valid else "INVALID",
        "reasons": [reason],
    }
