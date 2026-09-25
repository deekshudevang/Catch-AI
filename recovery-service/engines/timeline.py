from .base import CATCHEngine
import os
from .constants import RECOVERY_ENGINES_DIR

class CATCHTimeline(CATCHEngine):
    name = "timeline"
    display_name = "CATCH Timeline"
    upstream_component = "Plaso"
    
    def health_check(self) -> str:
        return "READY" if os.path.exists(os.path.join(RECOVERY_ENGINES_DIR, "catch-timeline")) else "NOT_FOUND"
