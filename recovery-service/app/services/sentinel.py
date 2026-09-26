import os
import time
import threading
from datetime import datetime
import uuid
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from app.database import SessionLocal
from app.models import FileEvent, RecoveryCandidate, MonitoredDirectory

class SentinelHandler(FileSystemEventHandler):
    def __init__(self, db_session):
        self.db = db_session

    def on_created(self, event):
        if event.is_directory:
            return
        
        path = event.src_path
        filename = os.path.basename(path)
        ext = os.path.splitext(filename)[1]
        
        # Log to file_events
        file_event = FileEvent(
            event_id=str(uuid.uuid4()),
            path=path,
            filename=filename,
            event_type='CREATED',
            source='sentinel',
            status='PROCESSED',
            created_at=datetime.utcnow()
        )
        self.db.add(file_event)
        
        # Add to recovery_candidates
        candidate = RecoveryCandidate(
            candidate_id=str(uuid.uuid4()),
            path=path,
            filename=filename,
            extension=ext,
            size=os.path.getsize(path) if os.path.exists(path) else 0,
            event_type='CREATED',
            status='DETECTED',
            source='sentinel',
            detected_at=datetime.utcnow()
        )
        self.db.add(candidate)
        self.db.commit()
        print(f"Sentinel detected creation: {path}")

def start_sentinel(monitor_dir: str):
    if not os.path.exists(monitor_dir):
        os.makedirs(monitor_dir, exist_ok=True)
        
    db = SessionLocal()
    
    # Register directory
    existing = db.query(MonitoredDirectory).filter(MonitoredDirectory.path == monitor_dir).first()
    if not existing:
        md = MonitoredDirectory(path=monitor_dir, status='active')
        db.add(md)
        db.commit()
        
    event_handler = SentinelHandler(db)
    observer = Observer()
    observer.schedule(event_handler, monitor_dir, recursive=True)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

def run_sentinel_background(monitor_dir: str):
    t = threading.Thread(target=start_sentinel, args=(monitor_dir,), daemon=True)
    t.start()
    return t
