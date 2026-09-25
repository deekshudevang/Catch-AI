# Implementation Corrections and Accurate Current Scope

## Purpose

This document records the corrections made after reviewing the current application against the actual code. It should be used as the accurate explanation during project review, grading, and expo presentation.

The main point is simple: the project has a strong end-to-end forensic workflow, but some earlier wording made a few features sound more production-grade than the code currently is. This document separates what is implemented from what remains a future enhancement.

## Corrected Mental Model

The current application workflow is:

Case management stores owner, assignee, and sharing metadata -> evidence upload creates an Evidence record and queues BullMQ -> the worker hashes the original file, encrypts it, deletes the temporary raw upload, and creates a controlled plaintext copy only for parsing -> parsers and normalizers convert artifacts into common event objects -> enrichment adds threat intelligence, MITRE mapping, risk score, and ML anomaly labels -> timeline/correlation routes expose the reconstructed sequence and attack alerts -> reports combine deterministic sections with AI-drafted writing -> human review is required before final use.

## Correction 1: Evidence Encryption

### Earlier Risk

The documentation could be misread as saying the project implements full envelope/KMS encryption.

### Accurate Current Implementation

The code currently uses AES-256-GCM encryption with a configured `EVIDENCE_ENCRYPTION_KEY`. In development, fallback key material can be derived from `JWT_SECRET` or a development key.

This means:

- Evidence files are encrypted before secure storage.
- MongoDB stores metadata, not raw evidence bytes.
- The system stores encryption metadata such as algorithm, key ID, IV/nonce, and authentication tag.
- The current implementation is not true envelope encryption.
- The current implementation does not create a unique per-file data key and wrap it using a KMS/master key.

### Correct Grade Impact

Evidence security is implemented and useful for the project, but production-grade KMS/envelope encryption remains a future enhancement.

## Correction 2: ML Anomaly Detection Baseline

### Earlier Risk

The anomaly module could be described as if it compares current evidence against a stored historical baseline such as one day, one week, or one month of normal behavior.

### Accurate Current Implementation

The Isolation Forest model compares events inside the current event set. It identifies outliers relative to the events provided in the current case or parse request.

This means:

- Isolation Forest anomaly detection is implemented.
- It works without needing labeled training data.
- It can flag unusual events inside the uploaded evidence set.
- It does not yet maintain or query a stored historical baseline of normal activity.

### Correct Grade Impact

The Member 4 ML requirement is complete for the project scope, but historical baseline comparison is a future enhancement.

## Correction 3: AI Usage Boundary

### Earlier Risk

The project name and report features could make it sound like AI performs core forensic detection.

### Accurate Current Implementation

AI is not used for the core forensic detection pipeline.

Code-based modules handle:

- Parsing.
- Normalization.
- SHA-256 hashing.
- Evidence encryption.
- Timeline construction.
- MITRE ATT&CK mapping.
- IOC enrichment.
- Risk scoring.
- Correlation alerts.
- Isolation Forest anomaly detection.

AI is mainly used for:

- Drafting report summaries.
- Drafting findings.
- Drafting recommendations.
- Case-chat assistance.

### Correct Grade Impact

This is a strength for the project because it reduces cost, avoids unnecessary LLM calls, and makes the forensic pipeline more auditable.

## Correction 4: Event Reconstruction Scope

### Earlier Risk

The phrase "event reconstruction" could be interpreted as full attacker intent reconstruction.

### Accurate Current Implementation

The system performs timeline reconstruction and deterministic attack correlation.

It does:

- Sort normalized events by timestamp.
- Group events into a timeline.
- Detect rule-based patterns such as brute force followed by success.
- Show correlated attack alerts.

It does not fully infer:

- The attacker's final goal.
- Complete attacker intent.
- A full narrative of every intrusion step without human review.

### Correct Grade Impact

The detection and timeline workflow is complete for the project scope, but full attacker intent inference remains outside the current implementation.

## Correction 5: Legal and Corporate Report Positioning

### Earlier Risk

The existence of legal and corporate report samples could make it sound like the app has selectable legal/corporate report profiles.

### Accurate Current Implementation

The system includes:

- Legal-context sample report.
- Corporate-context sample report.
- Neutral forensic wording in report prompts.
- Fixed report sections in generated reports.

The system does not yet include:

- A UI selector for legal vs corporate report mode.
- Separate legal/corporate report rulesets.
- Separate templates selected dynamically during report generation.

### Correct Grade Impact

Reporting is complete for the main workflow, but selectable report profiles are a future enhancement.

## Correction 6: Final Report Hashing and Frontend Export

### Earlier Risk

The documentation could make it sound like every frontend report export always goes through the backend hashing route.

### Accurate Current Implementation

The backend export route can generate a PDF, hash it, and store final product security metadata.

However, the current report detail frontend also supports browser print-window export. That frontend path can bypass the backend export route unless it is wired to call `/api/reports/:id/export`.

This means:

- Backend final report hashing exists.
- Backend export metadata support exists.
- The frontend still needs direct API wiring to guarantee every final user export is hashed and recorded.

### Correct Grade Impact

Member 6 is graded as A- instead of A because the core report pipeline is implemented, but final product security needs frontend export wiring for strict production use.

## Updated Member Impact Summary

| Member | Correction Impact |
| --- | --- |
| Member 1 | Deployment and repository work is still valid; production KMS/cloud hosting remains future work. |
| Member 2 | No downgrade. Parser phase is implemented and tested. |
| Member 3 | No downgrade. Detection is deterministic MITRE/risk/correlation, not AI-based intent inference. |
| Member 4 | ML is implemented, but historical baseline anomaly detection is future work. |
| Member 5 | Frontend is demo-ready, but report export should be wired to backend hashed export route. |
| Member 6 | Adjusted to A- because legal/corporate profiles and guaranteed frontend-backed report hashing are not fully implemented. |

## Final Correct Position

The project is complete and strong for academic submission and demonstration. The accurate positioning is:

- Code-based forensic pipeline.
- Secure evidence storage using AES-256-GCM configured-key encryption.
- Dedicated parsers and normalizers.
- Timeline reconstruction plus correlation alerts.
- Isolation Forest anomaly detection over current evidence events.
- AI-assisted reporting and case chat.
- Backend support for hashed report export.
- Human review required before legal or operational use.

The most important future improvements are:

- True envelope/KMS encryption.
- Stored historical anomaly baselines.
- Selectable legal/corporate report profiles.
- Frontend export path wired directly to the backend hashed PDF export route.
- More forensic artifact formats and broader detection rules.
