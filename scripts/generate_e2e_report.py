import sqlite3
import os
import json

db_path = 'recovery-service/catchai.db'
if not os.path.exists(db_path):
    print("No DB found")
    exit(1)

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
c = conn.cursor()

c.execute("SELECT * FROM execution_logs")
executions = [dict(row) for row in c.fetchall()]

c.execute("SELECT * FROM artifacts")
artifacts = [dict(row) for row in c.fetchall()]

md = "# REAL ENGINE E2E REPORT\n\n"
md += "## Execution Logs\n\n"
for ex in executions:
    md += f"### {ex['engine']} ({ex['tool']})\n"
    md += f"- **Input:** `{ex['input_reference']}`\n"
    md += f"- **Status:** `{ex['status']}`\n"
    md += f"- **Start:** `{ex['start_time']}`\n"
    md += f"- **End:** `{ex['end_time']}`\n"
    md += f"- **Duration:** `{ex['duration_ms']} ms`\n"
    md += f"- **Output:** `{ex['output_reference']}`\n"
    md += f"- **Output Metadata:**\n```json\n{json.dumps(json.loads(ex['output_metadata']) if ex.get('output_metadata') and ex['output_metadata'] != 'null' else {}, indent=2)}\n```\n\n"

md += "## Artifacts\n\n"
for art in artifacts:
    md += f"### Artifact: {art['name']}\n"
    md += f"- **Engine:** `{art['engine']}`\n"
    md += f"- **Type:** `{art['type']}`\n"
    md += f"- **Path:** `{art['path']}`\n"
    md += f"- **Size:** `{art['size']} bytes`\n"
    md += f"- **Confidence:** `{art['confidence']}`\n\n"

with open('docs/REAL_ENGINE_E2E_REPORT.md', 'w', encoding='utf-8') as f:
    f.write(md)
print("Wrote docs/REAL_ENGINE_E2E_REPORT.md")
