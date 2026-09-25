"""
Fragment Graph Builder.

Takes scored relationships and fragment features and produces
a GraphNode + GraphEdge list that can be stored in PostgreSQL and
served by GET /api/orchestrate/graph.

Layout: force-directed approximation using a simple repulsion +
spring algorithm so nodes don't all stack at origin.
"""

import math
from typing import List, Dict, Tuple
from .models import (
    Fragment, FragmentFeatures, FragmentRelationship,
    GraphNode, GraphEdge, FragmentGraphResult,
)

# Node type → display colour (stored as property for the frontend)
TYPE_COLOR = {
    "header": "#00d4ff",
    "body":   "#7c3aed",
    "footer": "#10b981",
    "orphan": "#f59e0b",
}

# Canvas dimensions for layout
CANVAS_W = 900
CANVAS_H = 600


def _initial_positions(n: int) -> List[Tuple[float, float]]:
    """Arrange nodes in a rough spiral so no two start at the same point."""
    positions = []
    cx, cy = CANVAS_W / 2, CANVAS_H / 2
    for i in range(n):
        angle = i * 2.399  # golden-angle increment (radians)
        radius = 40 + i * (min(CANVAS_W, CANVAS_H) / (2 * max(n, 1))) * 0.9
        x = cx + radius * math.cos(angle)
        y = cy + radius * math.sin(angle)
        positions.append((round(x, 1), round(y, 1)))
    return positions


def _force_layout(
    nodes: List[GraphNode],
    edges: List[GraphEdge],
    iterations: int = 60,
) -> List[GraphNode]:
    """
    Simplified Fruchterman-Reingold spring layout.
    Runs entirely in Python — no numpy required.
    """
    n = len(nodes)
    if n == 0:
        return nodes

    id_to_idx = {node.id: i for i, node in enumerate(nodes)}
    pos = [(node.x, node.y) for node in nodes]

    k = math.sqrt((CANVAS_W * CANVAS_H) / max(n, 1))
    temp = CANVAS_W / 10

    for _ in range(iterations):
        # Repulsion
        disp = [(0.0, 0.0)] * n
        for i in range(n):
            for j in range(i + 1, n):
                dx = pos[i][0] - pos[j][0]
                dy = pos[i][1] - pos[j][1]
                dist = max(math.hypot(dx, dy), 0.01)
                force = (k * k) / dist
                fx, fy = (dx / dist) * force, (dy / dist) * force
                disp[i] = (disp[i][0] + fx, disp[i][1] + fy)
                disp[j] = (disp[j][0] - fx, disp[j][1] - fy)

        # Attraction
        for edge in edges:
            si = id_to_idx.get(edge.source)
            ti = id_to_idx.get(edge.target)
            if si is None or ti is None:
                continue
            dx = pos[si][0] - pos[ti][0]
            dy = pos[si][1] - pos[ti][1]
            dist = max(math.hypot(dx, dy), 0.01)
            force = (dist * dist) / k
            fx, fy = (dx / dist) * force, (dy / dist) * force
            disp[si] = (disp[si][0] - fx, disp[si][1] - fy)
            disp[ti] = (disp[ti][0] + fx, disp[ti][1] + fy)

        # Apply displacement + cooling
        for i in range(n):
            dx, dy = disp[i]
            d = max(math.hypot(dx, dy), 0.01)
            move = min(d, temp)
            pos[i] = (
                min(CANVAS_W - 20, max(20, pos[i][0] + (dx / d) * move)),
                min(CANVAS_H - 20, max(20, pos[i][1] + (dy / d) * move)),
            )

        temp = max(temp * 0.92, 1.0)

    # Write positions back
    for i, node in enumerate(nodes):
        node.x = round(pos[i][0], 1)
        node.y = round(pos[i][1], 1)

    return nodes


class FragmentGraph:
    """Builds a complete graph from fragments + relationships."""

    def build_graph(
        self,
        fragments: List[Fragment],
        features: List[FragmentFeatures],
        relationships: List[FragmentRelationship],
        scan_source: str = "",
    ) -> FragmentGraphResult:

        initial_pos = _initial_positions(len(fragments))
        feat_map: Dict[str, FragmentFeatures] = {f.fragment_id: f for f in features}

        nodes: List[GraphNode] = []
        for idx, frag in enumerate(fragments):
            feat = feat_map.get(frag.id)
            x, y = initial_pos[idx]
            label = f"{frag.fragment_type.upper()} @ {frag.offset}"
            if frag.file_type_hint:
                label += f" [{frag.file_type_hint}]"

            nodes.append(GraphNode(
                id=frag.id,
                label=label,
                type=frag.fragment_type,
                x=x,
                y=y,
                properties={
                    "offset": frag.offset,
                    "length": frag.length,
                    "entropy": frag.entropy,
                    "file_type": frag.file_type_hint or "unknown",
                    "color": TYPE_COLOR.get(frag.fragment_type, "#888"),
                    "mean_byte": feat.mean_byte_value if feat else None,
                    "magic_bytes": frag.magic_bytes or feat.magic_bytes if feat else None,
                },
            ))

        edges: List[GraphEdge] = [
            GraphEdge(
                source=rel.source_id,
                target=rel.target_id,
                weight=rel.score,
                relationship_type=rel.relationship_type,
            )
            for rel in relationships
        ]

        # Apply force layout for readable positioning
        nodes = _force_layout(nodes, edges)

        return FragmentGraphResult(
            nodes=nodes,
            edges=edges,
            total_fragments=len(fragments),
            total_relationships=len(relationships),
            scan_source=scan_source,
        )
