import sqlite3
import os

db_path = 'recovery-service/catchai.db'
if not os.path.exists(db_path):
    print("No DB found")
    exit(1)

conn = sqlite3.connect(db_path)
c = conn.cursor()
c.execute("PRAGMA table_info(execution_logs)")
for row in c.fetchall():
    print(row)

c.execute("PRAGMA table_info(artifacts)")
for row in c.fetchall():
    print(row)

c.execute("PRAGMA table_info(validations)")
for row in c.fetchall():
    print(row)
