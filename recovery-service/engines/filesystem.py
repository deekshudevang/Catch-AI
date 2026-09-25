import os
import sys
import time
from typing import Any, Dict

from .base import CATCHEngine
from .constants import RECOVERY_ENGINES_DIR

catch_fs_path = os.environ.get("CATCH_FS_PATH", os.path.join(RECOVERY_ENGINES_DIR, "catch-filesystem"))
if catch_fs_path not in sys.path:
    sys.path.insert(0, catch_fs_path)

class CATCHFilesystemRecovery(CATCHEngine):
    name = "filesystem"
    display_name = "CATCH Filesystem Recovery"
    upstream_component = "pytsk3_data-recovery"
    
    def health_check(self) -> str:
        try:
            import pytsk3
            from src.ntfs_parser import NTFSParser
            return "READY"
        except ImportError:
            return "NOT_FOUND"

    def execute(self, image: Any, **kwargs) -> Any:
        import pytsk3
        from src.ntfs_parser import NTFSParser
        
        if not image or not os.path.exists(image):
            raise FileNotFoundError(f"Evidence file not found: {image}")
            
        start_time = time.time()
        
        parser = NTFSParser(image)
        if not parser.initialize():
            raise RuntimeError("Failed to initialize NTFS Parser")
            
        try:
            files = parser.get_file_list()
            duration_ms = int((time.time() - start_time) * 1000)
            
            return {
                "engine": self.name,
                "status": "SUCCESS",
                "version": getattr(pytsk3, "get_version", lambda: "unknown")(),
                "input_reference": image,
                "files_found": len(files),
                "files": files,
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
        finally:
            if parser:
                parser.close()
