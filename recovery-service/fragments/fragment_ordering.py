
from typing import List
from .models import FragmentGraphResult

def order_fragments(graph: FragmentGraphResult) -> List[str]:
    # Directed graph traversal
    nodes = {n.id: n for n in graph.nodes}
    edges = graph.edges
    
    in_degree = {n: 0 for n in nodes}
    out_edges = {n: [] for n in nodes}
    for e in edges:
        in_degree[e.target] += 1
        out_edges[e.source].append(e)
        
    start_nodes = [n for n, deg in in_degree.items() if deg == 0]
    if not start_nodes:
        start_nodes = list(nodes.keys())
        
    ordered = []
    current = start_nodes[0]
    while current:
        ordered.append(current)
        outs = out_edges[current]
        if not outs:
            break
        outs.sort(key=lambda e: e.weight, reverse=True)
        current = outs[0].target
        if current in ordered: # loop prevention
            break
            
    return ordered
