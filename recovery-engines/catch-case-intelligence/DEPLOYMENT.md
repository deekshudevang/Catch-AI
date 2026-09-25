# ForensicAI Deployment

This project is split into four runtime services:

- `client`: React/Vite frontend served by nginx.
- `server`: Express API, authentication, evidence APIs, parsing APIs, reports, MITRE/IOC/anomaly endpoints.
- `evidence-worker`: BullMQ worker that performs queued parsing, hashing, encryption, normalization, correlation, and ML anomaly enrichment.
- `mongo` and `redis`: metadata persistence and job queue storage.

## Local Docker Run

Create a production-grade evidence key before running outside local testing:

```powershell
[Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Then start the stack:

```powershell
$env:EVIDENCE_ENCRYPTION_KEY="replace-with-64-hex-char-key"
$env:JWT_SECRET="replace-with-long-random-secret"
docker compose up --build
```

Open the app at `http://localhost:5173`. The API is available at `http://localhost:5000/api`.

## Required Environment Variables

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string for cases, evidence metadata, jobs, reports, and audit logs. |
| `REDIS_URL` | Redis connection string used by BullMQ job queues. |
| `JWT_SECRET` | Signs user sessions and must be unique per deployment. |
| `EVIDENCE_ENCRYPTION_KEY` | AES-256-GCM key for secured evidence storage. Use 64 hex chars or 32-byte base64. |
| `EVIDENCE_KEY_ID` | Rotation identifier stored with encrypted evidence metadata. |
| `AI_API_KEY` | Optional report-writing/chat provider key. Parsing and anomaly detection do not require AI. |
| `ABUSEIPDB_API_KEY` | Optional IOC enrichment for IP reputation. |
| `VIRUSTOTAL_API_KEY` | Optional IOC enrichment for file/hash reputation. |
| `PARSER_MAX_RECORDS` | Maximum records read per parser run. |
| `ML_CONTAMINATION` | Isolation Forest anomaly sensitivity. Default: `0.15`. |

## Evidence Storage Layout

MongoDB stores metadata only: case details, upload status, SHA-256 hash, encryption metadata, parser summaries, normalized event JSON, job status, and report metadata.

Actual uploaded evidence bytes are stored in `EVIDENCE_STORE_DIR` after AES-256-GCM encryption. In Docker Compose this maps to the `server-data` volume under `/data/evidence-store`. Temporary parser files and report exports are stored in `/data/tmp`.

## GitLab CI

The `.gitlab-ci.yml` pipeline performs:

1. Backend validation with `node --check` and Python parser/ML compilation.
2. Parser phase smoke testing against a live API with MongoDB and Redis services. The job generates fresh samples for system logs, metadata, registry entries, JSON metadata, and classic `.pcap`; EVTX export is included on Windows local runs and skipped in Linux CI.
3. Frontend production build with Vite.
4. Docker image packaging for the API/worker image and frontend image.

GitLab registry push runs when registry credentials are available in CI. Configure these protected variables for deployment pipelines:

- `JWT_SECRET`
- `EVIDENCE_ENCRYPTION_KEY`
- `EVIDENCE_KEY_ID`
- `AI_API_KEY` if report writing or case chat should use an external model
- `ABUSEIPDB_API_KEY` and `VIRUSTOTAL_API_KEY` if real IOC enrichment is required

## GitLab Remote Setup

This repository currently needs a GitLab project URL before it can be pushed to GitLab. After creating an empty GitLab project, add the remote:

```powershell
git remote add gitlab https://gitlab.com/<namespace>/<project>.git
git push -u gitlab HEAD:main
```

Keep the existing `origin` remote if you still want to mirror the GitHub copy.

## Manual Health Checks

```powershell
Invoke-RestMethod http://localhost:5000/api/health
Invoke-RestMethod "http://localhost:5000/api/anomalies?limit=10"
```

The evidence worker should remain running alongside the API. Uploading evidence without the worker will create jobs but will not complete queued parsing.
