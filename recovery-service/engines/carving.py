from .base import CATCHEngine
import os
from .constants import RECOVERY_ENGINES_DIR

class CATCHCarving(CATCHEngine):
    name = "carving"
    display_name = "CATCH Carving"
    upstream_component = "TestDisk/PhotoRec"
    
    def health_check(self) -> str:
        return "READY" if os.path.exists(os.path.join(RECOVERY_ENGINES_DIR, "catch-carving")) else "NOT_FOUND"
