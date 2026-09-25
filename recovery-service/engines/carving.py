import os
import time
import subprocess
from pathlib import Path
from typing import Any

from .base import CATCHEngine
from .constants import RECOVERY_ENGINES_DIR

class CATCHCarving(CATCHEngine):
    name = "carving"
    display_name = "CATCH Carving"
    upstream_component = "TestDisk/PhotoRec"
    capabilities = ["SOURCE_PRESENT", "DEPENDENCY_READY", "RUNTIME_READY", "INTEGRATION_TESTED", "ACTUALLY_USED"]

    def __init__(self):
        super().__init__()
        # Determine the photorec executable path based on OS
        if os.name == 'nt':
            self.photorec_bin = os.path.join(RECOVERY_ENGINES_DIR, "catch-carving-bin", "testdisk-7.2", "photorec_win.exe")
        else:
            self.photorec_bin = os.path.join(RECOVERY_ENGINES_DIR, "catch-carving-bin", "testdisk-7.2", "photorec")

    def health_check(self) -> str:
        if os.path.exists(self.photorec_bin):
            return "READY"
        return "NOT_FOUND"

    def execute(self, image: Any, **kwargs) -> Any:
        if not image or not os.path.exists(image):
            raise FileNotFoundError(f"Evidence file not found: {image}")

        start_time = time.time()

        output_dir = kwargs.get("output_dir", os.path.join(os.path.dirname(image), "carved_files"))
        os.makedirs(output_dir, exist_ok=True)

        cmd = [self.photorec_bin, "/d", os.path.join(output_dir, "recup_dir"), "/cmd", image, "partition_none,search"]

        env = os.environ.copy()
        if os.name == 'nt':
            # Bypass UAC prompt for photorec_win.exe since we just want it to carve a file
            env["__COMPAT_LAYER"] = "RunAsInvoker"

        try:
            # We use subprocess.run, capturing output to avoid CLI clutter
            result = subprocess.run(cmd, env=env, capture_output=True, text=True, shell=False, timeout=600)
            duration_ms = int((time.time() - start_time) * 1000)

            # Count the recovered files in output_dir
            recovered_files = []
            for root, dirs, files in os.walk(output_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    recovered_files.append({
                        "name": file,
                        "size": os.path.getsize(file_path),
                        "path": file_path
                    })

            if result.returncode != 0 and not recovered_files:
                raise RuntimeError(f"PhotoRec failed with code {result.returncode}. Output: {result.stdout}\n{result.stderr}")

            return {
                "engine": self.name,
                "status": "SUCCESS",
                "version": "7.2",
                "input_reference": image,
                "output_reference": output_dir,
                "files_found": len(recovered_files),
                "files": recovered_files,
                "duration_ms": duration_ms,
                "error": None
            }
        except Exception as e:
            return {
                "engine": self.name,
                "status": "FAILED",
                "input_reference": image,
                "error": str(e)
            }
