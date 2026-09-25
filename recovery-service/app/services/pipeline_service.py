import os
import uuid
from fragments.fragment_detector import FragmentDetector
from fragments.relationship_scoring import score_relationship
from fragments.fragment_graph import FragmentGraph
from fragments.fragment_ordering import order_fragments
from fragments.reconstruction import reconstruct_fragments
from fragments.validation import validate_reconstruction

def run_deterministic_pipeline(input_path: str, output_dir: str) -> dict:
    with open(input_path, "rb") as f:
        data = f.read()
        
    detector = FragmentDetector(chunk_size=1024)
    fragments = detector.detect(data)
    
    graph = FragmentGraph()
    for frag in fragments:
        graph.add_node(frag)
        
    for i in range(len(fragments)):
        for j in range(len(fragments)):
            if i != j:
                score_data = score_relationship(fragments[i], fragments[j])
                if score_data["relationship_score"] > 0:
                    graph.add_edge(fragments[i]["id"], fragments[j]["id"], score_data)
                    
    order_result = order_fragments(graph)
    
    output_path = os.path.join(output_dir, f"recovered_{uuid.uuid4().hex[:8]}.out")
    reconstruction_result = reconstruct_fragments(graph, order_result["selected_path"], output_path)
    
    validation_result = validate_reconstruction(output_path)
    
    return {
        "success": True,
        "fragments": fragments,
        "graph": graph,
        "ordering": order_result,
        "reconstruction": reconstruction_result,
        "validation": validation_result,
        "output_path": output_path
    }
