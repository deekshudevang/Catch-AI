import sqlite3
conn = sqlite3.connect('catchai.db')
res = conn.execute('SELECT engine, status, result, error FROM execution_logs WHERE engine="fragment_analysis"').fetchall()
print(res)
