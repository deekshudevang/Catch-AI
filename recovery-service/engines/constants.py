"""Engine constants — avoids circular imports."""
import os

RECOVERY_ENGINES_DIR = os.environ.get(
    "RECOVERY_ENGINES_DIR",
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "recovery-engines")
)
