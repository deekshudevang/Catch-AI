from .base import CATCHEngine
import os
from .constants import RECOVERY_ENGINES_DIR

class CATCHCaseIntelligence(CATCHEngine):
    name = "case_intelligence"
    display_name = "CATCH Case Intelligence"
    upstream_component = "RecoveryAI"
    
    def health_check(self) -> str:
        return "READY" if os.path.exists(os.path.join(RECOVERY_ENGINES_DIR, "catch-case-intelligence")) else "NOT_FOUND"
