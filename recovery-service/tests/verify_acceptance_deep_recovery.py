import os
import hashlib
import json
import sys

def sha256(path):
    h = hashlib.sha256()
    if os.path.exists(path):
        with open(path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                h.update(chunk)
        return h.hexdigest()
    return "NOT_FOUND"

jpg_src = r"C:\Users\deeks\OneDrive\Desktop\Catch-AI-repo\recovery-frontend\node_modules\force-graph\example\img-nodes\imgs\dog.jpg"
png_src = r"C:\Users\deeks\OneDrive\Desktop\Catch-AI-repo\recovery-frontend\src\assets\hero.png"
pdf_src = r"C:\Users\deeks\OneDrive\Desktop\Catch-AI-repo\testdisk-7.2\testdisk.pdf"
image_src = os.path.join(os.path.dirname(__file__), "..", "test-carving.img")

print("--- HASH VALIDATION ---")
print(f"Original JPG SHA256: {sha256(jpg_src)}")
print(f"Original PNG SHA256: {sha256(png_src)}")
print(f"Original PDF SHA256: {sha256(pdf_src)}")
print(f"Test image SHA256: {sha256(image_src)}")

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from engines.deep_recovery import CATCHDeepRecovery

print("\n--- RUNNING DEEP RECOVERY ENGINE DIRECTLY ---")
engine = CATCHDeepRecovery()
output_dir = os.path.join(os.path.dirname(__file__), "..", "acceptance_deep_recovery_output")
try:
    result = engine.execute(image_src, output_dir=output_dir, mode="auto")
    print("\n--- DEEP RECOVERY EXECUTION PROVENANCE ---")
    print(json.dumps({k: v for k, v in result.items() if k not in ('files', 'results')}, indent=2))
    
    print("\n--- REAL OUTPUT HASHES ---")
    if 'files' in result:
        for f in result['files']:
            print(f"{f.get('name')} ({f.get('size')} bytes)")
            print(f"  SHA256: {sha256(f.get('path'))}")
except Exception as e:
    import traceback
    traceback.print_exc()
