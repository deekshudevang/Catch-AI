from .base import CATCHEngine
import os
import uuid
import re
from typing import Any
from .constants import RECOVERY_ENGINES_DIR
import time

class CATCHFragmentAnalysis(CATCHEngine):
    name = "fragment_analysis"
    display_name = "CATCH Fragment Analysis"
    upstream_component = "CompDec"

    def health_check(self) -> str:
        return "READY"

    def execute(self, image: Any, **kwargs) -> Any:
        job_id = kwargs.get("job_id")
        if not job_id:
            return {"status": "FAILED", "error": "No job_id provided"}

        from app.database import SessionLocal
        from app.models import Artifact, Fragment, ExecutionLog
        from fragments.extractor import FragmentExtractor
        from fragments.features import FeatureExtractor
        from fragments.relationship import RelationshipScorer
        from fragments.graph import FragmentGraph
        import hashlib

        db = SessionLocal()
        artifacts = db.query(Artifact).filter(Artifact.recovery_job_id == job_id).all()

        # Parse real offsets from deep-recover ExecutionLogs
        deep_logs = db.query(ExecutionLog).filter(ExecutionLog.engine == "deep_recovery").all()
        sha256_to_offset = {}
        for log in deep_logs:
            if log.result and "results" in log.result:
                carved = log.result["results"].get("carved_files", [])
                for f in carved:
                    sha_val = f.get("sha256")
                    if sha_val:
                        sha256_to_offset[sha_val] = f.get("start_offset", 0)

        fragments_found = 0
        relationships_found = 0
        reconstructions = 0
        validated = 0
        t0 = time.time()

        # Handle duplicates by tracking processed SHA256s
        processed_shas = set()

        extractor = FragmentExtractor()
        feat_extractor = FeatureExtractor()
        scorer = RelationshipScorer()
        graph_builder = FragmentGraph()

        for art in artifacts:
            if not os.path.exists(art.path):
                continue

            # Verify SHA256 matches before processing
            sha256_hash = hashlib.sha256()
            with open(art.path, "rb") as f:
                for byte_block in iter(lambda: f.read(4096), b""):
                    sha256_hash.update(byte_block)
            actual_sha256 = sha256_hash.hexdigest()

            if actual_sha256 != art.sha256:
                continue # Skip if mismatched

            if actual_sha256 in processed_shas:
                continue # Skip duplicates
            processed_shas.add(actual_sha256)

            offset = 0
            if art.source_engine == 'deep-recover':
                # Use real offset if available
                if actual_sha256 in sha256_to_offset:
                    offset = sha256_to_offset[actual_sha256]
                else:
                    m = re.search(r'_(\d+)_', art.filename)
                    if m:
                        offset = int(m.group(1))

            # Full fragment analysis pipeline
            frags = extractor.extract(art.path)
            feats = feat_extractor.extract_batch(frags, art.path)
            rels = scorer.score_all(frags, feats)
            graph = graph_builder.build_graph(frags, feats, rels, scan_source=art.path)

            for frag in frags:
                f_db = Fragment(
                    fragment_id=str(uuid.uuid4()),
                    job_id=job_id,
                    evidence_id=image,
                    source_engine="fragment_analysis",
                    source_artifact=art.artifact_id,
                    source_path=art.path,
                    source_offset=offset,
                    source_length=art.size,
                    file_offset=frag.offset,
                    fragment_size=frag.length,
                    fragment_type=frag.fragment_type,
                    mime_type=art.mime_type or frag.magic_bytes,
                    sha256=art.sha256,
                    entropy=frag.entropy,
                    status="ANALYZED"
                )
                db.add(f_db)
                fragments_found += 1

            relationships_found += len(rels)
            if len(rels) > 0:
                reconstructions += 1

        db.commit()
        db.close()

        duration = int((time.time() - t0) * 1000)

        return {
            "engine": "fragment_analysis",
            "status": "SUCCESS",
            "duration_ms": duration,
            "fragments_found": fragments_found,
            "relationships_found": relationships_found,
            "reconstructions": reconstructions,
            "validated": validated,
            "output_reference": None,
            "error": None
        }
