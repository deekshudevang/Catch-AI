import sys
import os
import sqlite3
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app, get_db
from engines.carving import CATCHCarving

client = TestClient(app)

def test_gate():
    # 1. REGISTRY
    engine = CATCHCarving()
    
    # 4. API & 2. ORCHESTRATOR
    image_path = os.path.abspath("test-carving.img")
    print(f"Testing API with {image_path}")
    response = client.post("/api/recover/scan", json={"target_path": image_path, "engine": "carving"})
    print("API Response:", response.status_code, response.json())
    
    # 3. DATABASE
    db_path = "catchai.db"
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("SELECT * FROM recovery_executions ORDER BY id DESC LIMIT 1")
        row = cur.fetchone()
        print("Latest DB row:", row)
        conn.close()
    
    # 6. FAILURE TESTS
    resp_no_image = client.post("/api/recover/scan", json={"target_path": "nonexistent.img", "engine": "carving"})
    print("Failure test (nonexistent):", resp_no_image.status_code, resp_no_image.json())

if __name__ == "__main__":
    test_gate()
