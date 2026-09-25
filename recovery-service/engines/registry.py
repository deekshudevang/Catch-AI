"""CATCH-AI Engine Registry."""
from .filesystem import CATCHFilesystemRecovery
from .deep_recovery import CATCHDeepRecovery
from .case_intelligence import CATCHCaseIntelligence
from .ewf import CATCHEvidenceEWF
from .timeline import CATCHTimeline
from .fragment_analysis import CATCHFragmentAnalysis
from .filesystem_analysis import CATCHFilesystemAnalysis
from .carving import CATCHCarving

CATCH_ENGINE_REGISTRY = {
    "filesystem":         CATCHFilesystemRecovery,
    "deep_recovery":      CATCHDeepRecovery,
    "case_intelligence":  CATCHCaseIntelligence,
    "ewf":                CATCHEvidenceEWF,
    "timeline":           CATCHTimeline,
    "fragment_analysis":  CATCHFragmentAnalysis,
    "filesystem_analysis": CATCHFilesystemAnalysis,
    "carving":            CATCHCarving,
}

def get_engine(name: str):
    return CATCH_ENGINE_REGISTRY.get(name)
