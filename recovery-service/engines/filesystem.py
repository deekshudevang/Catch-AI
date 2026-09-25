from .base import CATCHEngine
import os
from .constants import RECOVERY_ENGINES_DIR

class CATCHFilesystemRecovery(CATCHEngine):
    name = "filesystem"
    display_name = "CATCH Filesystem Recovery"
    upstream_component = "pytsk3_data-recovery"
    
    def health_check(self) -> str:
        return "READY" if os.path.exists(os.path.join(RECOVERY_ENGINES_DIR, "catch-filesystem")) else "NOT_FOUND"
