import sqlite3
import os
import json

db_path = 'recovery-service/catchai.db'
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
c = conn.cursor()

c.execute("""
SELECT * FROM execution_logs
WHERE input_reference LIKE '%test-evidence.img%'
ORDER BY id DESC LIMIT 4
""")
executions = [dict(row) for row in c.fetchall()]

order = {'filesystem': 1, 'carving': 2, 'deep_recovery': 3, 'fragment_analysis': 4}
executions.sort(key=lambda x: order.get(x['engine'], 99))

c.execute("SELECT job_id FROM recovery_jobs ORDER BY created_at DESC LIMIT 1")
job_row = c.fetchone()
if job_row:
    latest_job_id = job_row['job_id']
    c.execute("SELECT * FROM artifacts WHERE recovery_job_id=? AND size != 4096 ORDER BY id DESC LIMIT 20", (latest_job_id,))
    artifacts = [dict(row) for row in c.fetchall()]
    
    c.execute("SELECT * FROM fragments WHERE job_id=? ORDER BY id DESC LIMIT 20", (latest_job_id,))
    fragments = [dict(row) for row in c.fetchall()]
else:
    artifacts = []
    fragments = []

md = "# REAL ENGINE E2E REPORT\n\n"
md += "## Execution Logs for `test-evidence.img`\n\n"
for ex in executions:
    md += f"### {ex['engine']}\n"
    md += f"- **Input:** `{ex['input_reference']}`\n"
    md += f"- **Status:** `{ex['status']}`\n"
    md += f"- **Duration:** `{ex['duration_ms']} ms`\n"
    md += f"- **Output Reference:** `{ex['output_reference']}`\n"
    if ex.get('result'):
        try:
            res = json.loads(ex['result'])
            md += f"- **Result Data:**\n```json\n{json.dumps(res, indent=2)}\n```\n"
        except:
            pass
    md += "\n"

md += "## Artifacts Recovered\n\n"
for art in artifacts:
    md += f"- **{art['filename']}**: size={art['size']}, engine={art['source_engine']}, path={art['path']}\n"

md += "\n## Fragments Found\n\n"
for frag in fragments:
    md += f"- **{frag['fragment_id']}**: offset={frag['source_offset']}, length={frag['source_length']}, type={frag['fragment_type']}, status={frag.get('status', '')}\n"

with open('docs/REAL_ENGINE_E2E_REPORT.md', 'w', encoding='utf-8') as f:
    f.write(md)

print("Report generated successfully.")
