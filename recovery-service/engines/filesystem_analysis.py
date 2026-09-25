from .base import CATCHEngine
import os
from .constants import RECOVERY_ENGINES_DIR

class CATCHFilesystemAnalysis(CATCHEngine):
    name = "filesystem_analysis"
    display_name = "CATCH Filesystem Analysis"
    upstream_component = "Sleuth Kit"
    
    def health_check(self) -> str:
        return "READY" if os.path.exists(os.path.join(RECOVERY_ENGINES_DIR, "catch-filesystem-analysis")) else "NOT_FOUND"
