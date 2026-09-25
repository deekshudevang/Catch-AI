# REAL ENGINE E2E REPORT

## Execution Logs for `test-evidence.img`

### filesystem
- **Input:** `C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\\test-evidence.img`
- **Status:** `SUCCESS`
- **Duration:** `3 ms`
- **Output Reference:** `None`
- **Result Data:**
```json
{
  "engine": "filesystem",
  "status": "SUCCESS",
  "version": "20260715",
  "input_reference": "C:\\\\Users\\\\deeks\\\\OneDrive\\\\Desktop\\\\Catch-AI-repo\\\\test-evidence.img",
  "files_found": 19,
  "duration_ms": 3,
  "error": null,
  "files_count": 19
}
```

### carving
- **Input:** `C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\\test-evidence.img`
- **Status:** `SUCCESS`
- **Duration:** `2101 ms`
- **Output Reference:** `C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\carved_files`
- **Result Data:**
```json
{
  "engine": "carving",
  "status": "SUCCESS",
  "version": "7.2",
  "input_reference": "C:\\\\Users\\\\deeks\\\\OneDrive\\\\Desktop\\\\Catch-AI-repo\\\\test-evidence.img",
  "output_reference": "C:\\\\Users\\\\deeks\\\\OneDrive\\\\Desktop\\\\Catch-AI-repo\\carved_files",
  "files_found": 14,
  "duration_ms": 2098,
  "error": null,
  "files_count": 14
}
```

### deep_recovery
- **Input:** `C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\\test-evidence.img`
- **Status:** `SUCCESS`
- **Duration:** `141 ms`
- **Output Reference:** `C:\Users\deeks\OneDrive\Desktop\Catch-AI-repo\recovery-service\deep_recovery_86d88222`
- **Result Data:**
```json
{
  "engine": "deep_recovery",
  "status": "SUCCESS",
  "input_reference": "C:\\\\Users\\\\deeks\\\\OneDrive\\\\Desktop\\\\Catch-AI-repo\\\\test-evidence.img",
  "output_reference": "C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\\recovery-service\\deep_recovery_86d88222",
  "metadata_recovered_count": 0,
  "carved_count": 2,
  "files_found": 2,
  "results": {
    "metadata_files": [],
    "carved_files": [
      {
        "file_type": "bmp",
        "start_offset": 1643673,
        "end_offset": 10485760,
        "output_path": "C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\\recovery-service\\deep_recovery_86d88222\\bmp_000001643673_6bf1edf4.bmp",
        "size": 8842087,
        "sha256": "6bf1edf48cab440f8ea7c2712ed57d3996c5a1e7128c53fffbd767e1ec24e8b8"
      },
      {
        "file_type": "bmp",
        "start_offset": 1649284,
        "end_offset": 10485760,
        "output_path": "C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\\recovery-service\\deep_recovery_86d88222\\bmp_000001649284_35205010.bmp",
        "size": 8836476,
        "sha256": "35205010a232a20c4d2963c7ae837420c975b25e83610f5e3cdb5d9527d9411a"
      }
    ]
  },
  "duration_ms": 140,
  "error": null,
  "files_count": 2
}
```

### fragment_analysis
- **Input:** `C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\\test-evidence.img`
- **Status:** `SUCCESS`
- **Duration:** `0 ms`
- **Output Reference:** `None`
- **Result Data:**
```json
null
```

## Artifacts Recovered

- **bmp_000001649284_35205010.bmp**: size=8836476, engine=deep-recover, path=C:\Users\deeks\OneDrive\Desktop\Catch-AI-repo\recovery-service\deep_recovery_ebd6ffee\bmp_000001649284_35205010.bmp
- **bmp_000001643673_6bf1edf4.bmp**: size=8842087, engine=deep-recover, path=C:\Users\deeks\OneDrive\Desktop\Catch-AI-repo\recovery-service\deep_recovery_ebd6ffee\bmp_000001643673_6bf1edf4.bmp
- **report.xml**: size=15240, engine=catch-carving, path=C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\carved_files\recup_dir.9\report.xml
- **report.xml**: size=15241, engine=catch-carving, path=C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\carved_files\recup_dir.8\report.xml
- **report.xml**: size=15241, engine=catch-carving, path=C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\carved_files\recup_dir.7\report.xml
- **report.xml**: size=15241, engine=catch-carving, path=C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\carved_files\recup_dir.6\report.xml
- **report.xml**: size=1654, engine=catch-carving, path=C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\carved_files\recup_dir.5\report.xml
- **f0000000_testdisk_7.zip**: size=27581226, engine=catch-carving, path=C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\carved_files\recup_dir.5\f0000000_testdisk_7.zip
- **report.xml**: size=15241, engine=catch-carving, path=C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\carved_files\recup_dir.4\report.xml
- **report.xml**: size=15241, engine=catch-carving, path=C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\carved_files\recup_dir.3\report.xml
- **report.xml**: size=15241, engine=catch-carving, path=C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\carved_files\recup_dir.2\report.xml
- **report.xml**: size=15246, engine=catch-carving, path=C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\carved_files\recup_dir.14\report.xml
- **report.xml**: size=15247, engine=catch-carving, path=C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\carved_files\recup_dir.13\report.xml
- **report.xml**: size=15241, engine=catch-carving, path=C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\carved_files\recup_dir.12\report.xml
- **report.xml**: size=15240, engine=catch-carving, path=C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\carved_files\recup_dir.11\report.xml
- **report.xml**: size=15241, engine=catch-carving, path=C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\carved_files\recup_dir.10\report.xml
- **report.xml**: size=1441, engine=catch-carving, path=C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\carved_files\recup_dir.1\report.xml
- **bmp_000001649284_35205010.bmp**: size=8836476, engine=deep-recover, path=C:\Users\deeks\OneDrive\Desktop\Catch-AI-repo\recovery-service\deep_recovery_86d88222\bmp_000001649284_35205010.bmp
- **bmp_000001643673_6bf1edf4.bmp**: size=8842087, engine=deep-recover, path=C:\Users\deeks\OneDrive\Desktop\Catch-AI-repo\recovery-service\deep_recovery_86d88222\bmp_000001643673_6bf1edf4.bmp
- **report.xml**: size=15240, engine=catch-carving, path=C:\\Users\\deeks\\OneDrive\\Desktop\\Catch-AI-repo\carved_files\recup_dir.9\report.xml
