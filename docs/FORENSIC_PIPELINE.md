# CATCH-AI Forensic Pipeline

## 1. Evidence

An investigator supplies an evidence image or supported input.

The original input should be identified by its actual path, size, hash, and processing metadata when those values are available.

## 2. Engine execution

The orchestrator invokes engines that are applicable and available.

Typical integrations include:

- PyTSK3 for filesystem/NTFS analysis.
- PhotoRec/TestDisk for file carving.
- Deep-Recover for deep recovery.
- CATCH-AI fragment analysis for fragment extraction and relationship analysis.

Additional integrations exist in the repository, but they must be reported as available, unavailable, not required, or actually executed based on runtime evidence.

## 3. Artifacts

Every recovered or discovered artifact should retain the information that the backend actually knows, such as:

- artifact identifier;
- source execution;
- path;
- size;
- file type;
- hash;
- offsets when provided by the engine;
- validation state.

An artifact should not be described as deleted, recoverable, valid, or reconstructed unless the underlying processing path supports that description.

## 4. Fragment analysis

Fragments may be extracted from actual artifacts and analyzed for structural or content relationships.

Relationship scoring must use evidence-backed properties. Generic similarity alone is not sufficient justification for a forensic reconstruction.

Large raw fragment payloads should not be unnecessarily persisted in the database. Paths, offsets, lengths, hashes, and analysis metadata are preferable where they are sufficient.

## 5. Reconstruction

Reconstruction is deliberately conservative.

Valid outcomes include:

- SUCCESS — a unique evidence-backed reconstruction was established and validated.
- INCOMPLETE — required fragments/evidence are missing.
- AMBIGUOUS — multiple plausible structures remain.
- FAILED — processing was attempted but failed.
- NOT_SUPPORTED — the evidence format or available analysis does not support reconstruction.
- NOT_AVAILABLE — the required processing capability is unavailable.

The system must never convert ambiguity into success merely to make a dashboard look complete.

## 6. Validation

Validation should confirm the properties relevant to the artifact format and reconstruction method.

Examples include:

- format signatures;
- structural markers;
- required terminal markers;
- expected size relationships;
- hash calculation;
- parser-level validation.

A validation result must correspond to an actual check.

## 7. Integrity and reporting

Reports should be generated from persisted execution and artifact metadata. Claims such as immutable chain of custody, digital signatures, or court-ready certification require explicit implementation and verification; they should not be implied by a report screen alone.
