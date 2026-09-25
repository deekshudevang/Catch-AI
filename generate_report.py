import sqlite3
import pandas as pd

conn = sqlite3.connect("recovery-service/catchai.db")
jobs = pd.read_sql("SELECT * FROM recovery_jobs", conn)
artifacts = pd.read_sql("SELECT * FROM artifacts", conn)
fragments = pd.read_sql("SELECT * FROM fragments", conn)
executions = pd.read_sql("SELECT * FROM execution_logs", conn)

with open("REAL_FRAGMENT_REPORT.md", "w") as f:
    f.write("# CATCH-AI REAL FRAGMENT REPORT\n\n")
    f.write(f"## Jobs: {len(jobs)}\n")
    for _, job in jobs.iterrows():
        f.write(f"- Job ID: {job['job_id']} Status: {job['status']} Evidence: {job['evidence_id']} Duration: {job['duration_ms']}ms\n")
    
    f.write(f"\n## Executions: {len(executions)}\n")
    for _, ex in executions.iterrows():
        f.write(f"- Engine: {ex['engine']} Status: {ex['status']} Duration: {ex['duration_ms']}ms\n")
        
    f.write(f"\n## Artifacts by Engine\n")
    if not artifacts.empty:
        counts = artifacts['source_engine'].value_counts()
        for engine, count in counts.items():
            f.write(f"- {engine}: {count} artifacts\n")
            
    f.write(f"\n## Fragments by Engine\n")
    if not fragments.empty:
        counts = fragments['source_engine'].value_counts()
        for engine, count in counts.items():
            f.write(f"- {engine}: {count} fragments\n")
            
    f.write(f"\n## Fragment Source Offsets\n")
    if not fragments.empty:
        f.write(f"- Null source_offset count: {fragments['source_offset'].isna().sum()}\n")
        f.write(f"- Non-null source_offset count: {fragments['source_offset'].notna().sum()}\n")
        
print("Report generated successfully.")
