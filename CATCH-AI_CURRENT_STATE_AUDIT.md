# CATCH-AI Current State Audit

## 1. Architecture Alignment

### Current State
* **Frontend:** React + TypeScript (located in `forensic-ui/`).
* **Node.js Proxy:** An Express proxy (`forensic-backend/`) sits between the frontend and the Python backend. It handles Postgres connections using `pg` and proxies `/api/orchestrate/*` requests to the Python service.
* **Backend:** FastAPI (`recovery-service/`). It contains the actual forensic logic and sets up its own SQLAlchemy connection to PostgreSQL.
* **Database:** PostgreSQL is used, but there are multiple connection patterns (Node.js `pg` and Python `sqlalchemy`). MongoDB/pymongo references seem to have been already purged from requirements and core logic, but the dual Postgres connections remain. There are no Alembic migrations set up for the Python backend.

### Violations & Required Actions
1. **Remove Node.js Proxy:** The `forensic-backend/` is an unnecessary middleman. The React frontend should communicate directly with the FastAPI backend.
2. **Centralize Database Logic:** PostgreSQL must be the sole source of truth managed completely by the Python backend via SQLAlchemy and Alembic for migrations.
3. **Remove any stray mock states** if they exist in UI-backend communication.

## 2. Forensic Logic

### Current State
* **Fragments Pipeline:** The `orchestrator.py` successfully connects `extractor.py`, `features.py`, `relationship.py`, and `graph.py`. These perform basic but *real* analysis on raw bytes:
  * `extractor.py` reads 4096-byte chunks, computes Shannon entropy, and checks magic bytes.
  * `features.py` computes mean byte values, byte frequency variance, and run lengths.
  * `relationship.py` computes heuristic-based connection scores.
  * `graph.py` performs a basic force-directed layout purely in Python.
* **Engines (`recovery-service/engines/`):** 
  * `filesystem.py`, `carving.py`, `ewf.py` etc., do **not** implement any real recovery logic. They subclass `CATCHEngine` and rely on its default `execute()` method which simply returns `"NOT_SUPPORTED"`.
  * `orchestrator.trigger_engine()` catches this and blindly wraps it with `"status": "SUCCESS"`.

### Violations & Required Actions
1. **Implement Real Engine Execution:** Remove the dummy `"status": "SUCCESS"` wrappers in `orchestrator.trigger_engine()`. The engines must process actual raw file bytes or be properly integrated with actual underlying tools (e.g., `catch-filesystem`).
2. **Remove Default Mock Returns:** `CATCHEngine` base class should not silently return `"NOT_SUPPORTED"`. It should raise `NotImplementedError` to force actual implementation.
