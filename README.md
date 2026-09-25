# CATCH-AI

**AI-Assisted Intelligent Data Recovery and Digital Evidence Reconstruction**

CATCH-AI is a forensic recovery platform that combines a React/Vite investigator interface with a Python/FastAPI processing service. It is designed to make recovery work observable, traceable, and evidence-driven rather than presenting simulated results.

## What CATCH-AI does

- Accepts forensic evidence images and recovery inputs.
- Runs registered recovery/analysis engines through the Python service.
- Persists recovery jobs, engine executions, artifacts, and fragment records.
- Performs file-system analysis, file carving, deep recovery, and fragment analysis where the corresponding engine is available and actually invoked.
- Exposes recovered artifacts and execution metadata to the web interface.
- Supports fragment relationships and reconstruction with conservative validation semantics.
- Keeps unsupported, incomplete, ambiguous, and failed states distinct from successful recovery.

## Architecture

```
React + Vite + TypeScript
          |
          v
      FastAPI API
          |
          v
 Recovery orchestration
          |
          +--> Filesystem recovery
          +--> PhotoRec/TestDisk carving
          +--> Deep recovery
          +--> Fragment analysis
          +--> Additional registered engines
          |
          v
 SQLite persistence
          |
          v
 Jobs / Artifacts / Fragments / Graph / Validation / Reports
```

The current implementation uses SQLite for local persistence. The frontend should display the database/backend state that the API actually reports; it must not label the system as PostgreSQL unless that backend is genuinely configured and exposed.

## Repository layout

- `recovery-frontend/` — React/Vite/TypeScript investigator UI.
- `recovery-service/` — FastAPI service, persistence, orchestration, and engine adapters.
- `recovery-engines/` — integrated recovery engine sources/assets.
- `forensic-engines/` — additional forensic engine integrations.
- `tests/` — repository-level tests and fixtures.
- `recovery-service/tests/` — backend and integration tests.
- `scripts/` — verification, database, and reporting utilities.
- `evidence/` — local evidence/recovery workspace used by the project.
- `docs/` — project documentation.

## Forensic result rules

CATCH-AI follows an evidence-first rule:

> A result must come from an actual processing path. The UI must never invent a recovered file, confidence value, timestamp, offset, hash, relationship, threat indicator, or system metric.

Use explicit states such as:

- `WAITING`
- `RUNNING`
- `SUCCESS`
- `PARTIAL`
- `FAILED`
- `NOT_AVAILABLE`
- `NOT_SUPPORTED`
- `NOT_REQUIRED`
- `INCOMPLETE`
- `AMBIGUOUS`

For reconstruction, uncertainty must remain visible. A graph that does not establish a unique, evidence-backed ordering must not be reported as a successful reconstruction.

## Verified engine mappings

The project integrates or maps the following engines:

| CATCH-AI engine | Underlying technology |
|---|---|
| `catch-filesystem` | PyTSK3 / NTFS analysis |
| `catch-carving` | PhotoRec / TestDisk |
| `catch-deep-recovery` | Deep-Recover |
| `catch-ewf` | libewf |
| `catch-filesystem-analysis` | Sleuth Kit |
| `catch-fragment-analysis` | CATCH-AI fragment analysis; CompDec may be used only when actually invoked |
| `catch-timeline` | Plaso |
| `catch-case-intelligence` | ForensicAI |

Engine availability is runtime-dependent. An adapter existing in the repository is not proof that the underlying third-party engine was executed for a particular case.

## Running locally

### Backend

```powershell
cd recovery-service
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```powershell
cd recovery-frontend
npm install
npm run dev
```

The frontend and backend URLs are configured by the frontend API client. The default local backend is `http://localhost:8000`.

## Build verification

Frontend:

```powershell
cd recovery-frontend
npm run build
```

Backend tests:

```powershell
cd recovery-service
python -m pytest
```

Repository hygiene:

```powershell
git diff --check
```

## Real-data policy

Test images and generated fixtures may be used for validation, but production-facing screens must not substitute fake/demo values for missing backend data. If a value is unavailable, show `Not Available` or the appropriate explicit state.

## Security notes

- Treat evidence images as untrusted input.
- Do not execute recovered files as part of normal analysis.
- Keep artifact downloads restricted to approved repository/workspace paths.
- Do not commit credentials, API tokens, private keys, or investigator secrets.
- Do not delete or recreate the forensic database merely to hide schema or persistence problems.
- Preserve source hashes and execution metadata when they are actually produced by the processing pipeline.

## Project status

CATCH-AI is an active development project. Some engine adapters are implemented while others depend on their external binaries/libraries and runtime environment. The interface should expose that distinction instead of presenting every registered engine as fully available.

For the current architecture and verification guidance, see `docs/`.
