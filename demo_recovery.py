import os
import urllib.request
import json
import time

IMG_PATH = "dummy_drive.img"

print("1. Creating a virtual raw drive (1MB)...")
with open(IMG_PATH, 'wb') as f:
    f.write(b'\x00' * (1024 * 1024))

print("2. 'Saving' a file to the drive...")
# Simulate a JPG file header
jpg_header = b'\xff\xd8\xff\xe0\x00\x10\x4a\x46\x49\x46\x00\x01'
file_content = jpg_header + b'This is a top secret document that will be deleted.'

with open(IMG_PATH, 'r+b') as f:
    f.seek(512)  # Write at Sector 1
    f.write(file_content)

print("   -> File successfully saved as 'secret_document.jpg'")
time.sleep(1)

print("3. 'Deleting' the file...")
# In raw file systems, deleting often just removes the MFT/FAT entry
# leaving the raw data (the file_content above) intact on the drive.
print("   -> (Simulated OS deletion: File pointer removed from file table, but raw sectors remain untouched)")
time.sleep(1)

print("4. Running Catch-AI Forensic Recovery on the raw drive image...")
try:
    req = urllib.request.Request(
        "http://localhost:8000/api/recover/scan",
        data=json.dumps({
            "image_path": IMG_PATH,
            "evidence_id": "demo-ev-001",
            "case_id": "demo-case-001"
        }).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req) as response:
        if response.status == 200:
            data = json.loads(response.read().decode())
            job_id = data.get("job_id")
            print(f"   -> Recovery Job Started! Job ID: {job_id}")
            
            # Wait a moment for processing
            time.sleep(2)
            
            # Check artifacts found
            art_req = urllib.request.Request(f"http://localhost:8000/api/recoveries/{job_id}/artifacts")
            with urllib.request.urlopen(art_req) as art_response:
                if art_response.status == 200:
                    artifacts = json.loads(art_response.read().decode())
                    print(f"\n--- RECOVERY RESULTS ({len(artifacts)} files found) ---")
                    for a in artifacts:
                        print(f" - Found file: {a.get('filename')} (Size: {a.get('size')} bytes, Type: {a.get('type')})")
                        print(f"   Recovered by Engine: {a.get('source_engine')}")
                else:
                    print("Failed to fetch artifacts.")
        else:
            print(f"Error starting recovery: {response.status}")
except Exception as e:
    print(f"Error communicating with backend: {e}")
