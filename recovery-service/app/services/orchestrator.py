"""
CATCH-AI Recovery Orchestrator Service

Runs the full recovery pipeline:
  1. Fragment extraction   (fragments/extractor.py)
  2. Feature extraction    (fragments/features.py)
  3. Relationship scoring  (fragments/relationship.py)
  4. Graph building        (fragments/graph.py)
  5. Result persistence    (PostgreSQL via SQLAlchemy)

The latest graph is cached in memory and served by GET /api/orchestrate/graph.
"""

import os
import uuid
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from engines.registry import CATCH_ENGINE_REGISTRY

from fragments.extractor import FragmentExtractor
from fragments.features import FeatureExtractor
from fragments.relationship import RelationshipScorer
from fragments.graph import FragmentGraph
from fragments.models import FragmentGraphResult


class Orchestrator:
    def __init__(self):
        self.registry = CATCH_ENGINE_REGISTRY
        self._latest_graph: Optional[FragmentGraphResult] = None

    # ------------------------------------------------------------------
    # Full recovery pipeline
    # ------------------------------------------------------------------

    def run_recovery(self, image_path: str) -> Dict[str, Any]:
        """
        Full pipeline: extract → feature → score → graph.
        Returns a dict suitable for the API response.
        """
        execution_id = str(uuid.uuid4())

        # --- Stage 1: Fragment Extraction ---
        extractor = FragmentExtractor(chunk_size=4096)
        fragments = extractor.extract(image_path, max_fragments=300)

        # --- Stage 2: Feature Extraction ---
        feat_extractor = FeatureExtractor()
        features = feat_extractor.extract_batch(fragments, image_path=image_path)

        # --- Stage 3: Relationship Scoring ---
        scorer = RelationshipScorer()
        relationships = scorer.score_all(fragments, features)

        # --- Stage 4: Graph Building ---
        graph_builder = FragmentGraph()
        graph = graph_builder.build_graph(
            fragments, features, relationships,
            scan_source=image_path,
        )

        # Cache for /api/orchestrate/graph
        self._latest_graph = graph

        return {
            "execution_id": execution_id,
            "image_path": image_path,
            "fragments_extracted": len(fragments),
            "relationships_scored": len(relationships),
            "graph": {
                "nodes": len(graph.nodes),
                "edges": len(graph.edges),
            },
            "status": "SUCCESS",
        }

    def get_graph(self) -> FragmentGraphResult:
        """Return the latest computed graph (or empty if no scan run yet)."""
        if self._latest_graph is not None:
            return self._latest_graph
        return FragmentGraphResult(
            nodes=[],
            edges=[],
            total_fragments=0,
            total_relationships=0,
            scan_source=None,
        )

    # ------------------------------------------------------------------
    # Engine management (unchanged)
    # ------------------------------------------------------------------

    def trigger_engine(self, engine_name: str, image: Any, **kwargs) -> Dict[str, Any]:
        if engine_name not in self.registry:
            raise ValueError(f"Engine '{engine_name}' not found in registry.")

        engine_cls = self.registry[engine_name]
        engine_instance = engine_cls()
        execution_id = str(uuid.uuid4())
        started_at = datetime.now(timezone.utc)
        t0 = time.time()

        try:
            result = engine_instance.execute(image, **kwargs)
            status = "SUCCESS"
            logs = f"Execution completed for {engine_name}"
            error = None
        except Exception as e:
            result = None
            status = "FAILED"
            logs = str(e)
            error = str(e)

        completed_at = datetime.now(timezone.utc)
        duration_ms = int((time.time() - t0) * 1000)

        # Persist execution log
        try:
            from app.database import SessionLocal
            from app.models import ExecutionLog
            db = SessionLocal()
            # Strip large file lists from the persisted result to keep DB small
            persisted_result = None
            if result and isinstance(result, dict):
                persisted_result = {k: v for k, v in result.items() if k != "files"}
                persisted_result["files_count"] = len(result.get("files", []))
            log_entry = ExecutionLog(
                execution_id=execution_id,
                engine=engine_name,
                repository=getattr(engine_instance, "upstream_component", None),
                operation="execute",
                input_reference=str(image) if image else None,
                started_at=started_at,
                completed_at=completed_at,
                status=status,
                error=error,
                duration_ms=duration_ms,
                result=persisted_result,
                logs=logs,
            )
            db.add(log_entry)
            db.commit()
            db.close()
        except Exception:
            pass  # Don't fail the engine call if logging fails

        return {
            "execution_id": execution_id,
            "engine": engine_name,
            "status": status,
            "result": result,
            "logs": logs,
            "started_at": started_at.isoformat(),
            "completed_at": completed_at.isoformat(),
            "duration_ms": duration_ms,
            "error": error,
        }

    def get_registered_engines(self) -> List[str]:
        return list(self.registry.keys())

    def get_engine_health(self) -> Dict[str, str]:
        health: Dict[str, str] = {}
        for name, cls in self.registry.items():
            try:
                instance = cls()
                health[name] = instance.health_check()
            except Exception:
                health[name] = "ERROR"
        return health


orchestrator_service = Orchestrator()
