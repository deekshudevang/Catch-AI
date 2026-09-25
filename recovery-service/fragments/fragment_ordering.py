
def order_fragments(graph) -> dict:
    """
    Order fragments using graph edges (highest-weight greedy path).
    
    graph: FragmentGraph instance with:
      .nodes  — dict {id: fragment_dict}
      .edges  — list of dicts with "source", "target", "relationship_score"
    
    Returns dict with "selected_path" (list of node ids).
    """
    node_ids = list(graph.nodes.keys())
    edges = graph.edges

    if not node_ids:
        return {"selected_path": [], "method": "empty"}

    if not edges:
        # No relationships — return nodes sorted by their offset (physical order)
        sorted_ids = sorted(
            node_ids,
            key=lambda nid: graph.nodes[nid].get("offset", 0),
        )
        return {"selected_path": sorted_ids, "method": "offset_fallback"}

    # Build adjacency from edges
    in_degree = {n: 0 for n in node_ids}
    out_edges = {n: [] for n in node_ids}
    for e in edges:
        src, tgt = e["source"], e["target"]
        if src in in_degree and tgt in in_degree:
            in_degree[tgt] += 1
            out_edges[src].append(e)

    # Start from nodes with no incoming edges; fallback to all
    start_nodes = [n for n, deg in in_degree.items() if deg == 0]
    if not start_nodes:
        start_nodes = list(node_ids)

    ordered = []
    current = start_nodes[0]
    while current:
        ordered.append(current)
        outs = out_edges.get(current, [])
        if not outs:
            break
        outs.sort(key=lambda e: e.get("relationship_score", 0), reverse=True)
        current = outs[0]["target"]
        if current in ordered:  # loop prevention
            break

    # Append any nodes not reached by the greedy walk
    for nid in node_ids:
        if nid not in ordered:
            ordered.append(nid)

    return {"selected_path": ordered, "method": "graph_traversal"}
