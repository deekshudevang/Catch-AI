from .base import CATCHEngine
import os
from .constants import RECOVERY_ENGINES_DIR

class CATCHFragmentAnalysis(CATCHEngine):
    name = "fragment_analysis"
    display_name = "CATCH Fragment Analysis"
    upstream_component = "CompDec"
    
    def health_check(self) -> str:
        return "READY" if os.path.exists(os.path.join(RECOVERY_ENGINES_DIR, "catch-fragment-analysis")) else "NOT_FOUND"
