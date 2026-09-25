import os
import sys
import json
from app.services.pipeline_service import run_deterministic_pipeline

def print_json(data):
    # Strip binary data before printing
    if isinstance(data, dict) and "data" in data:
        data = {k: v for k, v in data.items() if k != "data"}
    print(json.dumps(data, indent=2, default=str))

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "demo":
        print("CATCH-AI DEMO")
        print("=============")
        
        # Create a dummy test fixture for demo
        fixture_dir = os.path.join(os.path.dirname(__file__), "..", "tests", "fixtures")
        os.makedirs(fixture_dir, exist_ok=True)
        input_path = os.path.join(fixture_dir, "test_fragmented.bin")
        
        if not os.path.exists(input_path):
            with open(input_path, "wb") as f:
                f.write(b"%PDF-1.4\n")
                f.write(b"x" * 1000)
                f.write(b"y" * 1000)
                f.write(b"%%EOF\n")
                
        output_dir = os.path.join(os.path.dirname(__file__), "..", "evidence", "recovered")
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"\nInput:\n{input_path}")
        
        result = run_deterministic_pipeline(input_path, output_dir)
        
        print("\nFragments detected:")
        print(len(result["fragments"]))
        
        print("\nRelationships:")
        for edge in result["graph"].edges:
            print(f"{edge['source'][:8]} -> {edge['target'][:8]} : Score {edge['relationship_score']} - {', '.join(edge['reasons'])}")
            
        print("\nSelected reconstruction:")
        print(" -> ".join(p[:8] for p in result["ordering"]["selected_path"]))
        
        print("\nReconstruction:")
        print(result["reconstruction"]["status"])
        
        print("\nValidation:")
        print(result["validation"]["status"])
        
        print("\nSHA-256:")
        print(result["reconstruction"]["sha256"])
        
if __name__ == "__main__":
    main()
