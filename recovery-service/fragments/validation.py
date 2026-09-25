from .classifier import classify_fragment
import hashlib

def validate_reconstruction(file_path: str) -> dict:
    try:
        with open(file_path, "rb") as f:
            data = f.read()
    except Exception:
        return {"status": "INVALID", "reasons": ["File not found"]}
        
    if not data:
        return {"status": "INVALID", "reasons": ["Empty file"]}
        
    classification = classify_fragment(data)
    status = "VALID" if classification["file_type"] != "UNKNOWN" else "UNKNOWN"
    
    sha256 = hashlib.sha256(data).hexdigest()
    
    return {
        "magic_bytes_valid": bool(classification["magic_bytes"]),
        "file_type": classification["file_type"],
        "size_bytes": len(data),
        "sha256": sha256,
        "status": status,
        "reasons": ["Passed basic magic byte and size validation" if status == "VALID" else "Unknown file signature"]
    }
