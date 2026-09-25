import hashlib

# RECONSTRUCTION STATES
# SUCCESS: All fragments processed and successfully reconstructed in order.
# INCOMPLETE: Partial reconstruction achieved, but not all nodes included.
# AMBIGUOUS: Could not resolve a single clear reconstruction path.
# FAILED: Reconstruction failed completely or encountered an error.
# NOT_SUPPORTED: File format is not supported for evidence-driven reconstruction.
# NOT_AVAILABLE: No fragments or relationships available to reconstruct.

def reconstruct_fragments(graph, ordered_ids: list, output_path: str):
    if not graph.nodes:
        return {"output_size": 0, "sha256": "", "status": "NOT_AVAILABLE"}

    edges = getattr(graph, 'edges', [])
    if not edges:
        return {"output_size": 0, "sha256": "", "status": "NOT_SUPPORTED"}

    if not ordered_ids:
        # Empty ordered_ids with edges usually means ambiguity or failure in ordering
        return {"output_size": 0, "sha256": "", "status": "AMBIGUOUS"}

    reconstructed_bytes = bytearray()
    for fid in ordered_ids:
        if fid in graph.nodes:
            reconstructed_bytes.extend(graph.nodes[fid]["data"])

    if not reconstructed_bytes:
        return {"output_size": 0, "sha256": "", "status": "FAILED"}

    try:
        with open(output_path, "wb") as f:
            f.write(reconstructed_bytes)
    except Exception:
        return {"output_size": 0, "sha256": "", "status": "FAILED"}

    sha256 = hashlib.sha256(reconstructed_bytes).hexdigest()

    if len(ordered_ids) == len(graph.nodes):
        status = "SUCCESS"
    else:
        status = "INCOMPLETE"

    return {
        "output_size": len(reconstructed_bytes),
        "sha256": sha256,
        "status": status
    }
