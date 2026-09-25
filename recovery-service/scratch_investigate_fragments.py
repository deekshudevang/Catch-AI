import sys
import os

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal
from app.models import Fragment, ExecutionLog, Artifact
from sqlalchemy import func

db = SessionLocal()

# 1. Total Fragments
total = db.query(Fragment).count()
print(f"Total Fragments: {total}")

# 2. Fragments per source engine
print("\nFragments per source engine:")
engine_counts = db.query(Fragment.source_engine, func.count(Fragment.id)).group_by(Fragment.source_engine).all()
for engine, count in engine_counts:
    print(f"  {engine}: {count}")

# 3. Fragments per type
print("\nFragments per type:")
type_counts = db.query(Fragment.fragment_type, func.count(Fragment.id)).group_by(Fragment.fragment_type).all()
for ftype, count in type_counts:
    print(f"  {ftype}: {count}")

# 4. Print sample
print("\nSample Fragments (first 5):")
sample = db.query(Fragment).limit(5).all()
for f in sample:
    print(f"fragment_id: {f.fragment_id}")
    print(f"  source_artifact: {f.source_artifact}")
    print(f"  source_engine: {f.source_engine}")
    print(f"  source_path: {f.source_path}")
    print(f"  fragment_type: {f.fragment_type}")
    print(f"  fragment_size: {f.fragment_size}")
    print(f"  sha256: {f.sha256}")
    print(f"  entropy: {f.entropy}")
    print(f"  file_offset: {f.file_offset}")
    print(f"  source_offset: {f.source_offset}")
    print(f"  status: {f.status}")
    print("")

db.close()
