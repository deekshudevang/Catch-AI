# tools/registry.py — compatibility shim
# The real registry lives in engines/registry.py
from engines.registry import CATCH_ENGINE_REGISTRY as REGISTRY, get_engine  # noqa: F401
