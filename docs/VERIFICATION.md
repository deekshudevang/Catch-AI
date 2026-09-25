# CATCH-AI Verification

## Verification principles

A feature is verified only when the relevant code path has been exercised and the observed result matches the expected behavior.

Repository inspection alone can establish that code exists. It cannot establish that a runtime dependency is installed, an engine executed successfully, or a UI route works end-to-end.

## Frontend

Run:

```powershell
cd recovery-frontend
npm run build
```

Confirm:

- TypeScript/Vite build succeeds;
- no broken imports;
- no deleted-route failures;
- production build completes.

## Backend

Run:

```powershell
cd recovery-service
python -m pytest
```

Then start the service and check the health endpoint.

Confirm:

- service starts;
- database opens;
- API responds;
- relevant engine adapters report their real availability.

## Real engine verification

For an engine to be marked SUCCESS for a test:

1. the input exists;
2. the engine process/library is available;
3. execution actually occurs;
4. the process returns an appropriate result;
5. output is inspected;
6. output metadata is persisted where required;
7. the result can be retrieved through the API.

An adapter that merely returns a placeholder object is not a successful engine integration.

## Data integrity checks

For artifacts that expose hashes:

- calculate the hash using the backend's actual artifact bytes;
- compare the stored value with the calculated value;
- report mismatches as failures.

For reconstruction:

- verify the reconstructed bytes against the format-specific validation rules;
- distinguish missing evidence from invalid evidence;
- never silently repair corrupted input and call it recovered.

## UI verification

Exercise the actual routes and confirm that they display backend data.

Pay special attention to:

- dashboard;
- cases;
- recovery job;
- artifacts;
- fragments;
- graph;
- validation;
- timeline;
- reports;
- engines;
- audit;
- settings.

A page containing a visual placeholder is not an implemented feature.

## Final gate

Before a hackathon/demo build is described as ready:

```powershell
git diff --check
cd recovery-frontend
npm run build
cd ..\recovery-service
python -m pytest
```

Then run at least one real evidence workflow and inspect the resulting persisted records.

The final report should state what was actually verified, what remains unavailable, and what was not tested.
