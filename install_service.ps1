#Requires -RunAsAdministrator

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ServiceDir = Join-Path $ScriptDir "recovery-service"
$VenvDir = Join-Path $ServiceDir "venv"
$PythonExe = Join-Path $VenvDir "Scripts\python.exe"
$ServiceScript = Join-Path $ServiceDir "service.py"

Write-Host "Installing CATCH-AI Recovery Service..."

# Ensure pywin32 is installed and scripts are copied
& $PythonExe -m pip install -r (Join-Path $ServiceDir "requirements.txt")
& $PythonExe (Join-Path $VenvDir "Scripts\pywin32_postinstall.py") -install

# Install the service
& $PythonExe $ServiceScript --startup auto install

# Start the service
Start-Service -Name "CatchAIRecoveryService"

Write-Host "Service installed and started successfully!"
