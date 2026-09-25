import os
import sys
import time
import uuid
from typing import Any

from .base import CATCHEngine
from .constants import RECOVERY_ENGINES_DIR

catch_deep_path = os.environ.get("CATCH_DEEP_PATH", os.path.join(RECOVERY_ENGINES_DIR, "catch-deep-recovery"))
if catch_deep_path not in sys.path:
    sys.path.insert(0, catch_deep_path)

class CATCHDeepRecovery(CATCHEngine):
    name = "deep_recovery"
    display_name = "CATCH Deep Recovery"
    upstream_component = "deep-recover"

    def health_check(self) -> str:
        if not os.path.exists(catch_deep_path):
            return "NOT_FOUND"
        try:
            import pytsk3
            from deep_recover.cli import run_metadata, run_carve
            return "READY"
        except ImportError:
            return "MISSING_DEPS"

    def execute(self, image: Any, **kwargs) -> Any:
        try:
            import pytsk3
        except ImportError:
            pass

        from deep_recover.cli import MetadataRecovery, Carver, HAVE_PYTSK3

        output_dir = kwargs.get("output_dir", os.path.join(os.getcwd(), f"deep_recovery_{uuid.uuid4().hex[:8]}"))
        os.makedirs(output_dir, exist_ok=True)

        mode = kwargs.get("mode", "auto") # auto, metadata, carve
        types = kwargs.get("types", None)
        offset = kwargs.get("offset", 0)

        start_time = time.time()

        results = {
            "metadata_files": [],
            "carved_files": []
        }

        did_metadata = False
        if mode in ("auto", "metadata"):
            if HAVE_PYTSK3:
                try:
                    mr = MetadataRecovery(str(image), output_dir, offset=offset)
                    deleted = mr.list_deleted("/")
                    for entry in deleted:
                        recovered = mr.recover_entry(entry)
                        results["metadata_files"].append({
                            "name": recovered.name,
                            "inode": recovered.inode,
                            "size": recovered.size,
                            "output_path": recovered.output_path
                        })
                    did_metadata = True
                except Exception as e:
                    results["metadata_error"] = str(e)
            else:
                results["metadata_error"] = "pytsk3 not installed"

        if mode == "metadata" and not did_metadata:
            return {
                "engine": self.name,
                "status": "FAILED",
                "input_reference": image,
                "error": results.get("metadata_error", "Metadata recovery failed")
            }

        if mode in ("auto", "carve"):
            try:
                carver = Carver(str(image), output_dir, file_types=types)
                carved, stats = carver.carve()
                for c in carved:
                    results["carved_files"].append({
                        "file_type": c.file_type,
                        "start_offset": c.start_offset,
                        "end_offset": c.end_offset,
                        "output_path": c.output_path,
                        "size": c.size,
                        "sha256": c.sha256
                    })
            except Exception as e:
                results["carve_error"] = str(e)
                if mode == "carve":
                    return {
                        "engine": self.name,
                        "status": "FAILED",
                        "input_reference": image,
                        "error": str(e)
                    }

        duration_ms = int((time.time() - start_time) * 1000)

        all_files = []
        all_files.extend(results["metadata_files"])
        all_files.extend([
            {"name": os.path.basename(f["output_path"]), "size": f["size"], "path": f["output_path"], "type": f["file_type"]}
            for f in results["carved_files"]
        ])

        return {
            "engine": self.name,
            "status": "SUCCESS",
            "input_reference": image,
            "output_reference": output_dir,
            "metadata_recovered_count": len(results["metadata_files"]),
            "carved_count": len(results["carved_files"]),
            "files_found": len(all_files),
            "files": all_files,
            "results": results,
            "duration_ms": duration_ms,
            "error": None
        }
