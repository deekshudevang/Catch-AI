from .base import CATCHEngine
import os
from .constants import RECOVERY_ENGINES_DIR

class CATCHDeepRecovery(CATCHEngine):
    name = "deep_recovery"
    display_name = "CATCH Deep Recovery"
    upstream_component = "deep-recover"
    
    def health_check(self) -> str:
        return "READY" if os.path.exists(os.path.join(RECOVERY_ENGINES_DIR, "catch-deep-recovery")) else "NOT_FOUND"
