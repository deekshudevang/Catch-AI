
import hashlib

def validate_reconstruction(file_path: str) -> dict:
    try:
        with open(file_path, "rb") as f:
            data = f.read()
    except Exception:
        return {"status": "INVALID", "reasons": ["File not found"]}
        
    if not data:
        return {"status": "INVALID", "reasons": ["Empty file"]}
        
    is_valid_png = data.startswith(b"\x89PNG") and data.endswith(b"IEND\xaeB`\x82")
    status = "VALID" if is_valid_png else "INVALID"
    
    sha256 = hashlib.sha256(data).hexdigest()
    
    return {
        "magic_bytes_valid": data.startswith(b"\x89PNG"),
        "file_type": "PNG" if is_valid_png else "UNKNOWN",
        "size_bytes": len(data),
        "sha256": sha256,
        "status": status,
        "reasons": ["Passed PNG structural validation" if status == "VALID" else "Invalid structure"]
    }
