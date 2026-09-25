from .base import CATCHEngine
import os
from .constants import RECOVERY_ENGINES_DIR

class CATCHEvidenceEWF(CATCHEngine):
    name = "ewf"
    display_name = "CATCH Evidence EWF"
    upstream_component = "libewf"
    
    def health_check(self) -> str:
        return "READY" if os.path.exists(os.path.join(RECOVERY_ENGINES_DIR, "catch-ewf")) else "NOT_FOUND"
