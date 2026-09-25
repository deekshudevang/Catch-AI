import sqlite3
import os

db_path = 'recovery-service/catchai.db'
if not os.path.exists(db_path):
    print("No DB found")
    exit(1)

conn = sqlite3.connect(db_path)
c = conn.cursor()
c.execute("SELECT engine, status, error, input_reference, duration_ms, exit_code FROM execution_logs ORDER BY id DESC LIMIT 20")
for row in reversed(c.fetchall()):
    print(row)
