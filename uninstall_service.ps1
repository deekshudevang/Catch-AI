#Requires -RunAsAdministrator

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ServiceDir = Join-Path $ScriptDir "recovery-service"
$VenvDir = Join-Path $ServiceDir "venv"
$PythonExe = Join-Path $VenvDir "Scripts\python.exe"
$ServiceScript = Join-Path $ServiceDir "service.py"

Write-Host "Uninstalling CATCH-AI Recovery Service..."

# Stop the service if running
if (Get-Service "CatchAIRecoveryService" -ErrorAction SilentlyContinue) {
    Stop-Service -Name "CatchAIRecoveryService" -ErrorAction SilentlyContinue
    & $PythonExe $ServiceScript remove
    Write-Host "Service uninstalled successfully!"
} else {
    Write-Host "Service not found."
}
