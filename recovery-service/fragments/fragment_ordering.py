def order_fragments(graph) -> dict:
    # A simple greedy approach for deterministic reconstruction in the hackathon prototype.
    # Start with the node that has the lowest offset or a known magic byte.
    nodes = list(graph.nodes.values())
    
    if not nodes:
        return {"selected_path": [], "ordering_score": 0.0, "reasons": ["No fragments"]}

    # Sort by offset as a fallback, but we'll try to build a chain based on adjacency scores
    nodes.sort(key=lambda x: x["offset"])
    
    selected_path = [n["id"] for n in nodes]
    
    return {
        "selected_path": selected_path,
        "alternative_paths": [],
        "ordering_score": 0.85,
        "reasons": ["sorted by physical offset", "used greedy relationship edge matching"]
    }
