# CATCH-AI Architecture

## Overview

CATCH-AI is split into two primary application layers:

1. **Investigator interface** — React, Vite, and TypeScript.
2. **Forensic processing service** — Python and FastAPI.

The frontend is responsible for investigation workflows, visualization, filtering, and presentation. The backend is responsible for evidence processing, engine execution, persistence, and API responses.

## Processing flow

```
Evidence
  |
  v
Recovery job
  |
  v
Engine selection / execution
  |
  +--> Filesystem analysis
  +--> File carving
  +--> Deep recovery
  +--> Fragment analysis
  |
  v
Artifacts
  |
  v
Fragments
  |
  v
Evidence-backed relationships
  |
  v
Reconstruction
  |
  v
Validation / integrity
  |
  v
API
  |
  v
Investigator UI
```

## Persistence

The current local implementation uses SQLite. Recovery jobs and derived records are persisted so that the interface can display historical processing results.

Database creation is not the same as database migration. Schema changes must be handled deliberately and must not be solved by deleting an existing evidence database.

## Engine registry

The backend has an engine registry/adaptor layer. An engine should expose:

- stable identifier;
- display name;
- availability;
- version when known;
- execution status;
- input/output information;
- errors when execution fails.

The registry must not manufacture success when an executable or library is missing.

## API boundary

The frontend should consume API results rather than duplicating forensic calculations. Compatibility fields should be treated as compatibility data when they are not independently measured.

For example, a field that defaults to zero or mirrors an artifact count must not be presented as an independently verified forensic measurement.

## Frontend boundary

The interface should remain data-driven:

- no hardcoded case records;
- no fictional reports;
- no invented progress percentages;
- no fake telemetry;
- no static success badges for unexecuted operations.

Unavailable backend data should produce an explicit empty or unavailable state.
