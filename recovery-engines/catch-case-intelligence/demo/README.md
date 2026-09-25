# ForensicAI Demo Evidence Files

## Overview
These files simulate a **complete cyber attack lifecycle** for demonstrating all ForensicAI platform capabilities. Upload any of these files into a case to showcase the full pipeline.

---

## Files

| File | Parser Used | Events | Purpose |
|------|-------------|--------|---------|
| `forensicai_demo_log.log` | System Log Parser | 49 | Full syslog-format attack narrative |
| `forensicai_demo_events.csv` | CSV Parser | 33 | Structured event table with columns |

---

## Attack Scenario: "Operation Midnight Breach"

A simulated advanced persistent threat (APT) attack on a corporate Linux server, following the full MITRE ATT&CK kill chain:

### Timeline of Events

| Time | Phase | MITRE Tactic | What Happens |
|------|-------|-------------|--------------|
| 02:14 | Normal | — | Legitimate admin SSH login |
| 03:01 | Initial Access | TA0001 | Brute-force SSH attack from 192.168.1.105 (6 failed attempts) |
| 03:02 | Initial Access | T1078 | Successful root login after brute force |
| 03:03 | Privilege Escalation | T1548 | Attacker reads /etc/shadow, creates backdoor admin account |
| 03:05 | Discovery | T1046 | Network port scan (SMB 445, RDP 3389, WinRM 5985) |
| 03:06 | Lateral Movement | T1021 | SSH lateral movement to secondary host |
| 03:07 | Execution | T1059 | Remote script download via curl & wget |
| 03:08 | Command & Control | T1071 | Malware payload activated, C2 beacon to 185.141.25.168 |
| 03:09 | C2 | T1071.004 | DNS tunneling to c2-relay.darkops.io |
| 03:10 | Collection | T1005 | Unauthorized access to MySQL database (credit cards, PII) |
| 03:11 | Exfiltration | T1041 | 847MB data exfiltrated to C2 server via TLS |
| 03:13 | Persistence | T1053 | Cron job beacon persistence |
| 03:15 | Persistence | T1547 | Boot persistence via rc.local modification |
| 03:16 | Defense Evasion | T1036 | SSH binary trojanized |
| 03:18 | Execution | T1059 | Reverse shell via netcat |
| 03:19 | Impact | T1486 | Ransomware: 1247 files encrypted to .locked |
| 03:20 | Defense Evasion | T1070 | Log clearing (auth.log, syslog, bash_history) |
| 03:21 | Defense Evasion | T1070.006 | Timestomping on malware binary |
| 07:30 | Response | — | Incident response team login & disk imaging |

---

## What ForensicAI Detects

### Severity Distribution
- **Critical**: 12 events (brute force success, malware, ransomware, exfiltration)
- **Danger/Error**: 14 events (failed logins, port scans, anti-forensics)
- **Warning**: 15 events (failed attempts, C2 beacons, persistence)
- **Info**: 8 events (normal logins, routine operations)

### Event Types Triggered
- `authentication` — SSH brute force, lateral movement, credential stuffing
- `privilege_escalation` — sudo abuse, hidden admin account
- `network` — Port scanning, C2 beacon, reverse shell
- `malware` — Payload download, execution, ransomware
- `file_access` — Database file reads, PII access
- `data_transfer` — 847MB exfiltration
- `system` — Anti-forensics, log tampering

### IOCs Extracted
- **Attacker IP**: `192.168.1.105`
- **C2 Server IP**: `185.141.25.168`
- **C2 Domain**: `c2-relay.darkops.io`
- **Malware Path**: `/tmp/.hidden_svc`
- **Backdoor User**: `backdoor_admin`

### MITRE ATT&CK Coverage
This demo triggers detections across **10 MITRE tactics** and **15+ techniques**, showcasing ForensicAI's automated mapping:

| Tactic | Techniques |
|--------|-----------|
| Initial Access | T1078 (Valid Accounts), T1110 (Brute Force) |
| Execution | T1059 (Command/Script), T1569 (System Services) |
| Persistence | T1053 (Scheduled Task), T1547 (Boot Autostart) |
| Privilege Escalation | T1548 (Abuse Elevation) |
| Defense Evasion | T1070 (Indicator Removal), T1036 (Masquerading) |
| Discovery | T1046 (Network Service Scan) |
| Lateral Movement | T1021 (Remote Services) |
| Collection | T1005 (Data from Local System) |
| Command & Control | T1071 (Application Layer Protocol) |
| Exfiltration | T1041 (Exfiltration Over C2) |
| Impact | T1486 (Data Encrypted for Impact) |

---

## How to Demo

1. **Create a Case** → Name it "Operation Midnight Breach" with priority "Critical"
2. **Upload Evidence** → Upload `forensicai_demo_log.log` (or the CSV version)
3. **View Timeline** → See the full chronological attack story
4. **Check Anomalies** → ML flags brute force clusters, C2 beacons, and exfiltration spikes
5. **View MITRE Matrix** → See which tactics/techniques light up
6. **Open AI Chat** → Ask: "Summarize the attack", "Which IPs are malicious?", "What was exfiltrated?"
7. **Generate Report** → One-click court-ready forensic report with all findings
