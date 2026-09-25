from typing import Dict, List, Any

def _weight(edge: Any) -> float:
    value = edge.get("weight", edge.get("relationship_score", edge.get("score", 0.0))) if isinstance(edge, dict) else getattr(edge, "weight", getattr(edge, "score", 0.0))
    try: return float(value)
    except (TypeError, ValueError): return 0.0

def _source(edge: Any):
    return edge.get("source") if isinstance(edge, dict) else getattr(edge, "source", None)

def _target(edge: Any):
    return edge.get("target") if isinstance(edge, dict) else getattr(edge, "target", None)

def order_fragments(graph: Any) -> List[str]:
    """Deterministic, cycle-safe ordering compatible with legacy and Pydantic graphs."""
    raw_nodes = getattr(graph, "nodes", None)
    nodes: Dict[str, Any] = raw_nodes if isinstance(raw_nodes, dict) else {n.id: n for n in (raw_nodes or [])}
    if not nodes: return []

    out: Dict[str, List[Any]] = {node_id: [] for node_id in nodes}
    indegree = {node_id: 0 for node_id in nodes}
    for edge in getattr(graph, "edges", None) or []:
        s, t = _source(edge), _target(edge)
        if s in nodes and t in nodes and s != t:
            out[s].append(edge)
            indegree[t] += 1
    for edges in out.values():
        edges.sort(key=lambda e: (-_weight(e), _target(e) or ""))

    starts = sorted(k for k, v in indegree.items() if v == 0) or sorted(nodes)
    ordered, visited = [], set()
    current = starts[0]
    while current is not None and current not in visited:
        visited.add(current); ordered.append(current)
        choices = [e for e in out.get(current, []) if _target(e) not in visited]
        current = _target(choices[0]) if choices else None

    ordered.extend(k for k in sorted(nodes) if k not in visited)
    return ordered
