# Corporate Context Report Sample

## Executive Summary

The reviewed artifacts indicate suspicious authentication and post-login activity affecting administrative accounts on a Windows workstation and a Linux server. The activity includes repeated failed login attempts, a successful privileged login, command execution, payload retrieval, and persistence-related registry entries.

## Business Impact

Potential impact includes unauthorized administrative access, malware staging, persistence setup, and possible data movement. No final determination of data exfiltration should be made without reviewing network flow, endpoint telemetry, and file access logs.

## Priority Actions

1. Disable or reset affected privileged accounts.
2. Isolate impacted hosts pending validation.
3. Block known malicious IPs and domains observed in the evidence.
4. Collect additional EDR, firewall, DNS, and proxy logs.
5. Re-verify evidence hashes before final report approval.

## Technical Summary

- IOC: `45.227.254.20`
- IOC: `185.120.12.3`
- MITRE: T1110 Brute Force
- MITRE: T1078 Valid Accounts
- MITRE: T1059 Command and Scripting Interpreter
- MITRE: T1548.001 Sudo/Su Elevation
