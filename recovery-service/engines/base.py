from typing import List, Any

class CATCHEngine:
    name: str = "base"
    display_name: str = "CATCH Base Engine"
    upstream_component: str = "base"
    version: str = "1.0"
    capabilities: List[str] = []

    def detect(self, image: Any) -> Any:
        return "NOT_SUPPORTED"

    def analyze(self, image: Any) -> Any:
        return "NOT_SUPPORTED"

    def recover(self, image: Any) -> Any:
        return "NOT_SUPPORTED"

    def execute(self, image: Any, **kwargs) -> Any:
        return "NOT_SUPPORTED"

    def health_check(self) -> str:
        return "READY"
