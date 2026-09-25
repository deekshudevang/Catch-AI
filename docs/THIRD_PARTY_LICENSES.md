# CATCH-AI: Third-Party Licenses

This document outlines the licenses for the third-party repositories integrated into CATCH-AI.

## Dependencies

- **pytsk3_data-recovery**: Apache 2.0 (estimated)
- **ForensicAI**: MIT (estimated)
- **deep-recover**: MIT (estimated)
- **The Sleuth Kit (sleuthkit)**: IBM Public License (IPL), Common Public License (CPL), and GPL.
- **libewf**: LGPL v3
- **Plaso (log2timeline)**: Apache 2.0
- **TestDisk**: GPL v2 or later
- **compdec**: MIT (estimated)

## Implications for CATCH-AI

- The use of GPL-licensed tools (TestDisk, some parts of SleuthKit) means that if we statically link or deeply integrate with these tools, our resulting application may also need to be distributed under the GPL.
- A loosely coupled integration strategy (e.g., calling them as external executables or microservices) is recommended to maintain flexibility with CATCH-AI's own licensing.
