# Automated Digital Forensics Reporting Tool Samples

These samples are safe, synthetic artifacts for local demos and parser validation.

## Evidence Samples

- `evidence/system-logs/linux-auth-sample.txt`: Linux SSH authentication events.
- `evidence/system-logs/windows-security-sample.txt`: Exported Windows Security Event style records.
- `evidence/metadata/file-metadata-sample.csv`: Filesystem metadata rows.
- `evidence/registry/windows-registry-sample.reg`: Windows Registry autorun-style entries.

## Parser Smoke Samples

Run `npm run test:parser-phase` from `server/` while the API is running to generate fresh parser validation samples under `server/tmp/`. The smoke test creates Linux logs, Windows-style logs, metadata CSV/JSON, registry entries, a synthetic classic `.pcap`, and a Windows `.evtx` export when `wevtutil` is available. Each generated file is posted through `/api/parse` and checked for SHA-256 hashing, parser selection, normalization, risk scoring, MITRE mapping, and ML annotation.

## Report Samples

- `reports/legal-context-report-sample.md`: Court/legal oriented wording.
- `reports/corporate-context-report-sample.md`: Internal corporate incident response wording.

Upload these files through the Evidence page to exercise the parser, normalizer, timeline, IOC, MITRE, risk scoring, and reporting flow.
