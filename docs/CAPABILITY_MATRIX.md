# CATCH-AI: Capability Matrix

| Capability | PyTSK3 | ForensicAI | Deep-Recover | SleuthKit | LibEWF | Plaso | TestDisk | CompDec |
|---|---|---|---|---|---|---|---|---|
| Disk Image Parsing | Yes | No | No | Yes | Yes | Yes | Yes | No |
| File Recovery | Yes | No | Yes | Yes | No | No | Yes | No |
| AI Analysis | No | Yes | Yes | No | No | No | No | No |
| Timeline Generation| No | No | No | Yes | No | Yes | No | No |
| Compression/Decomp.| No | No | No | No | Yes | No | No | Yes |
| Scriptable API | Yes | Yes | Yes | C++ API| C API | Yes | No | No |

## Redundancies
- **File System parsing**: Handled by both SleuthKit and PyTSK3 (which wraps TSK). TestDisk also parses partitions.
- **Data Recovery**: TestDisk and SleuthKit overlap in recovery capabilities.
- **Disk Image handling**: Plaso, SleuthKit, and LibEWF all contain logic for handling disk images.

## Gaps
- Unified API across all tools.
- Real-time memory forensics.
- Integrated reporting generation.
