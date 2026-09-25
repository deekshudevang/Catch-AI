import sqlite3
import json

conn = sqlite3.connect('catchai.db')
cursor = conn.cursor()
cursor.execute("SELECT engine, status, error, logs FROM execution_logs WHERE status='FAILED' ORDER BY started_at DESC LIMIT 5")
for row in cursor.fetchall():
    print(f"Engine: {row[0]}, Status: {row[1]}")
    print(f"Error: {row[2]}")
    print(f"Logs: {row[3]}\n")
