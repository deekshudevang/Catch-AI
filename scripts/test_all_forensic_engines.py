"""Live engine health verification.

This script reports what is actually installed/configured. It does not claim
runtime or integration success unless the engine itself reports READY.
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SERVICE = os.path.join(ROOT, "recovery-service")
if SERVICE not in sys.path:
    sys.path.insert(0, SERVICE)

from engines.registry import CATCH_ENGINE_REGISTRY


def main():
    print("CATCH-AI Engine Verification")
    print("=" * 40)
    failed = 0
    for name, engine_cls in CATCH_ENGINE_REGISTRY.items():
        try:
            engine = engine_cls()
            health = engine.health_check()
        except Exception as exc:
            health = f"ERROR: {exc}"
        print(f"{name:24} {health}")
        if health != "READY":
            failed += 1
    print("=" * 40)
    print(f"Not-ready engines: {failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
