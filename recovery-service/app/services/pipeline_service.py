import hashlib
import os
import uuid

from fragments.fragment_detector import FragmentDetector
from fragments.relationship_scoring import score_relationship
from fragments.fragment_graph import FragmentGraph
from fragments.fragment_ordering import order_fragments
from fragments.reconstruction import reconstruct_fragments
from fragments.validation import validate_reconstruction


def run_deterministic_pipeline(input_path: str, output_dir: str) -> dict:
    if not os.path.isfile(input_path):
        raise FileNotFoundError(f"Input evidence file not found: {input_path}")
    os.makedirs(output_dir, exist_ok=True)

    with open(input_path, "rb") as f:
        data = f.read()
    input_sha256 = hashlib.sha256(data).hexdigest()

    detector = FragmentDetector(chunk_size=1024)
    fragments = detector.detect(data)

    graph = FragmentGraph()
    for frag in fragments:
        graph.add_node(frag)

    for i, source in enumerate(fragments):
        for j, target in enumerate(fragments):
            if i == j:
                continue
            score_data = score_relationship(source, target)
            if score_data["relationship_score"] > 0:
                graph.add_edge(source["id"], target["id"], score_data)

    ordered_ids = order_fragments(graph)
    output_path = os.path.join(output_dir, f"recovered_{uuid.uuid4().hex[:8]}.out")
    reconstruction_result = reconstruct_fragments(graph, ordered_ids, output_path)
    validation_result = validate_reconstruction(output_path)

    success = (
        reconstruction_result["status"] in {"COMPLETED", "PARTIAL"}
        and validation_result["status"] == "VALID"
    )

    return {
        "success": success,
        "input_path": input_path,
        "input_sha256": input_sha256,
        "fragments": fragments,
        "graph": graph,
        "ordering": {"selected_path": ordered_ids},
        "reconstruction": reconstruction_result,
        "validation": validation_result,
        "output_path": output_path,
    }
