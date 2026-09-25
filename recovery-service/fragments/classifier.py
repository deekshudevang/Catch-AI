FILE_SIGNATURES = {
    b"%PDF-": ("application/pdf", "PDF"),
    b"\xff\xd8\xff": ("image/jpeg", "JPEG"),
    b"\x89PNG\r\n\x1a\n": ("image/png", "PNG"),
    b"PK\x03\x04": ("application/zip", "ZIP"),
}

def classify_fragment(fragment_data: bytes) -> dict:
    magic = None
    file_type = "UNKNOWN"
    mime_type = "application/octet-stream"
    
    for sig, (mtype, ftype) in FILE_SIGNATURES.items():
        if fragment_data.startswith(sig):
            magic = sig
            mime_type = mtype
            file_type = ftype
            break
            
    return {
        "magic_bytes": magic.hex() if magic else None,
        "file_type": file_type,
        "mime_type": mime_type
    }
