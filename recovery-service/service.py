import logging
logging.basicConfig(filename=r'C:\Users\deeks\OneDrive\Desktop\Catch-AI-repo\recovery-service\service_debug.log', level=logging.DEBUG)
logging.info('Service script imported.')

import win32serviceutil
import win32service
import win32event
import servicemanager
import os
import sys
import subprocess

class CatchAIRecoveryService(win32serviceutil.ServiceFramework):
    _svc_name_ = "CatchAIRecoveryService"
    _svc_display_name_ = "CATCH-AI Recovery Service"
    _svc_description_ = "CATCH-AI forensic recovery service for evidence acquisition, filesystem analysis and deleted-data recovery."

    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
        self.process = None

    def SvcStop(self):
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.hWaitStop)
        if self.process:
            self.process.terminate()

    def SvcDoRun(self):
        servicemanager.LogMsg(servicemanager.EVENTLOG_INFORMATION_TYPE,
                              servicemanager.PYS_SERVICE_STARTED,
                              (self._svc_name_, ''))
        self.main()

    def main(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        python_exe = os.path.join(base_dir, "venv", "Scripts", "python.exe")
        logging.info(f"base_dir is {base_dir}")
        logging.info(f"python_exe is {python_exe}")
        
        cmd = [python_exe, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"]
        log_file = open(os.path.join(base_dir, "uvicorn_service.log"), "w")
        self.process = subprocess.Popen(cmd, cwd=base_dir, stdout=log_file, stderr=subprocess.STDOUT)
        logging.info(f"Subprocess started with PID {self.process.pid}")
        
        win32event.WaitForSingleObject(self.hWaitStop, win32event.INFINITE)
        if self.process:
            self.process.terminate()

if __name__ == '__main__':
    if len(sys.argv) == 1:
        servicemanager.Initialize()
        servicemanager.PrepareToHostSingle(CatchAIRecoveryService)
        servicemanager.StartServiceCtrlDispatcher()
    else:
        win32serviceutil.HandleCommandLine(CatchAIRecoveryService)

import logging
logging.basicConfig(filename=r'C:\Users\deeks\OneDrive\Desktop\Catch-AI-repo\recovery-service\service_debug.log', level=logging.DEBUG)
logging.info('Service script imported.')
