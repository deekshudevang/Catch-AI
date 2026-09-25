import sqlite3
import os

db_path = 'catchai.db'
if not os.path.exists(db_path):
    print("No DB found")
else:
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = c.fetchall()
    print("Tables:", tables)
    for t in tables:
        c.execute(f"SELECT * FROM {t[0]}")
        print(f"--- {t[0]} ---")
        print(c.fetchall())
