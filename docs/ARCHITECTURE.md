# CATCH-AI: Architecture & Integration Strategy

## Overview

CATCH-AI aims to provide a unified platform for digital forensic evidence recovery. It acts as an orchestration and analytical layer over several specialized third-party tools.

## Architecture

The system will use a modular, microservice-inspired architecture where CATCH-AI acts as the central orchestrator:

1.  **Core Orchestrator (CATCH-AI Core)**
    *   Written in Python.
    *   Provides the unified API and user interface (if applicable).
    *   Manages task execution and coordinates with external tools.

2.  **Execution Wrappers**
    *   Individual wrappers/adapters for each third-party tool.
    *   These wrappers will handle the invocation of CLI tools (like `testdisk`, `plaso`, `sleuthkit`) via subprocess calls.
    *   For Python-native libraries (like `pytsk3`, `ForensicAI`), they will be integrated directly but abstracted behind a standard internal interface.

3.  **Data Ingestion & Normalization Layer**
    *   Responsible for taking the output from disparate tools and normalizing it into a common data schema (e.g., JSON-based timelines or evidence logs).

4.  **AI Analysis Engine**
    *   Leverages `ForensicAI` and `deep-recover` to perform automated analysis on the extracted data.

## Integration Strategy

Due to licensing constraints (e.g., GPL for TestDisk) and architectural differences, we will adopt a **loose coupling** strategy:

*   **Subprocess Execution**: CLI tools will be executed as separate processes. This ensures GPL compliance (as they are not dynamically or statically linked) and prevents a crash in a third-party tool from crashing the CATCH-AI core.
*   **Standardized Interfaces**: Python wrappers will define a standard interface for operations (e.g., `extract_image`, `recover_files`, `generate_timeline`).
*   **Artifact Storage**: Tools will output data to intermediate files or a local database, which CATCH-AI will then parse and ingest.

## Dependency Management

*   Python dependencies will be managed via `requirements.txt` or `poetry`.
*   System-level dependencies (like C/C++ libraries for SleuthKit/libewf) will be documented and eventually containerized (Docker) for consistent deployments.
