# CATCH-AI Development Guide

## Technology

### Frontend

- React
- Vite
- TypeScript
- CSS
- API-driven investigator views

### Backend

- Python
- FastAPI
- SQLAlchemy/SQLite persistence
- Forensic engine adapters
- Fragment processing and validation

## Start the backend

```powershell
cd recovery-service
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Start the frontend

```powershell
cd recovery-frontend
npm install
npm run dev
```

## Verify

```powershell
cd recovery-frontend
npm run build
```

```powershell
cd recovery-service
python -m pytest
```

```powershell
git diff --check
```

## Engineering rules

1. Preserve the React/Vite/TypeScript frontend.
2. Preserve the Python/FastAPI forensic processing layer.
3. Do not replace real processing with mock values.
4. Do not delete the forensic database to solve schema or test problems.
5. Do not rename established engine directories without a migration plan.
6. Do not remove engine source or binaries while performing UI work.
7. Do not claim an engine was executed unless execution metadata proves it.
8. Do not show fake progress.
9. Do not persist unnecessary raw evidence bytes in database rows.
10. Keep forensic states explicit and machine-readable.
11. Keep UI compatibility fields clearly separated from measured forensic facts.
12. Run the build and relevant tests after substantial changes.

## UI development

The investigator interface should use the dark forensic workstation visual language:

- deep dark canvas;
- crimson/red primary identity;
- amber for warnings;
- green only for confirmed success;
- blue for informational states;
- monospace typography for hashes, offsets, IDs, and technical values;
- sharp, compact panels instead of excessive rounded cards.

Every page must be usable with real API data and must have loading, empty, unavailable, partial, and error states where applicable.
