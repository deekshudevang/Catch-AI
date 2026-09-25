import hashlib

def reconstruct_fragments(graph, ordered_ids: list, output_path: str):
    reconstructed_bytes = bytearray()
    status = "COMPLETED"
    
    for fid in ordered_ids:
        if fid in graph.nodes:
            reconstructed_bytes.extend(graph.nodes[fid]["data"])
        else:
            status = "PARTIAL"
            
    if not reconstructed_bytes:
        status = "FAILED"
        
    try:
        with open(output_path, "wb") as f:
            f.write(reconstructed_bytes)
    except Exception:
        status = "FAILED"
        
    sha256 = hashlib.sha256(reconstructed_bytes).hexdigest()
    
    return {
        "output_size": len(reconstructed_bytes),
        "sha256": sha256,
        "status": status
    }
