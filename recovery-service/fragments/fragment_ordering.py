def order_fragments(graph) -> dict:
    """
    Order fragments using graph edges evidence.
    Returns dict with "selected_path" (list of node ids) and "method".
    """
    node_ids = list(graph.nodes.keys())
    edges = getattr(graph, 'edges', [])

    if not node_ids:
        return {"selected_path": [], "method": "empty"}

    if not edges:
        # No relationships — return empty selected path to explicitly indicate failure
        return {"selected_path": [], "method": "no_evidence_fallback"}

    # Build adjacency
    in_degree = {n: 0 for n in node_ids}
    out_edges = {n: [] for n in node_ids}

    # We only care about edges with positive relationship scores
    valid_edges = [e for e in edges if e.get("relationship_score", 0) > 0]
    if not valid_edges:
        return {"selected_path": [], "method": "no_evidence_fallback"}

    for e in valid_edges:
        src, tgt = e.get("source"), e.get("target")
        if src in in_degree and tgt in in_degree:
            in_degree[tgt] += 1
            out_edges[src].append(e)

    # Start from nodes with no incoming edges;
    start_nodes = [n for n, deg in in_degree.items() if deg == 0]

    if not start_nodes or len(start_nodes) > 1:
        # Cyclic or ambiguous multiple start points
        return {"selected_path": [], "method": "ambiguous"}

    ordered = []
    current = start_nodes[0]

    while current:
        ordered.append(current)
        outs = out_edges.get(current, [])
        if not outs:
            break

        # Sort by relationship score descending
        outs.sort(key=lambda e: e.get("relationship_score", 0), reverse=True)
        best_score = outs[0].get("relationship_score", 0)

        # Check for ambiguity (multiple outgoing edges with same best score)
        best_outs = [o for o in outs if o.get("relationship_score", 0) == best_score]
        if len(best_outs) > 1:
            return {"selected_path": [], "method": "ambiguous"}

        current = best_outs[0].get("target")
        if current in ordered:  # loop prevention
            return {"selected_path": [], "method": "ambiguous"}

    method = "graph_traversal" if len(ordered) == len(node_ids) else "incomplete"
    return {"selected_path": ordered, "method": method}
