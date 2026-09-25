"""
Feature Extractor — derives numeric recovery features from raw Fragment bytes.

Features produced per fragment:
  - entropy          : Shannon entropy of the fragment data
  - mean_byte_value  : arithmetic mean of all byte values
  - byte_freq_var    : variance of the 256-bucket byte-frequency histogram
  - run_length       : average length of consecutive repeated byte runs
  - magic_bytes      : hex string of the first 4 bytes (for display)
  - fragment_type    : header / body / footer / orphan (from extractor)
  - file_type_hint   : MIME-like hint if magic matched
"""

import os
import math
import statistics
from typing import List, Optional
from .models import Fragment, FragmentFeatures


def _mean_byte(data: bytes) -> float:
    if not data:
        return 0.0
    return round(sum(data) / len(data), 4)


def _byte_freq_variance(data: bytes) -> float:
    if len(data) < 2:
        return 0.0
    freq = [0] * 256
    for b in data:
        freq[b] += 1
    return round(statistics.variance(freq), 4)


def _avg_run_length(data: bytes) -> float:
    """Average length of consecutive identical-byte runs."""
    if not data:
        return 0.0
    runs = 1
    run_count = 1
    for i in range(1, len(data)):
        if data[i] == data[i - 1]:
            run_count += 1
        else:
            runs += 1
            run_count += 1
    return round(run_count / runs, 4)


class FeatureExtractor:
    """
    Reads fragment raw bytes from the original image file and produces
    a FragmentFeatures object. Falls back to using fragment metadata
    (entropy already computed by the extractor) when the image is unavailable.
    """

    def extract_features(
        self,
        fragment: Fragment,
        image_path: Optional[str] = None,
    ) -> FragmentFeatures:

        raw: Optional[bytes] = None

        if image_path and os.path.isfile(image_path):
            try:
                with open(image_path, 'rb') as fh:
                    fh.seek(fragment.offset)
                    raw = fh.read(fragment.length)
            except OSError:
                raw = None

        # Compute features
        if raw:
            entropy = fragment.entropy  # already computed by extractor
            mean_bv = _mean_byte(raw)
            bfv = _byte_freq_variance(raw)
            rl = _avg_run_length(raw)
            magic_hex = raw[:4].hex() if len(raw) >= 4 else raw.hex()
        else:
            # Fallback: derive approximate values from stored metadata
            entropy = fragment.entropy
            mean_bv = 128.0  # unknown
            bfv = 0.0
            rl = 1.0
            magic_hex = None

        return FragmentFeatures(
            fragment_id=fragment.id,
            entropy=entropy,
            mean_byte_value=mean_bv,
            byte_freq_variance=bfv,
            run_length=rl,
            magic_bytes=magic_hex,
            fragment_type=fragment.fragment_type,
            file_type_hint=fragment.file_type_hint,
        )

    def extract_batch(
        self,
        fragments: List[Fragment],
        image_path: Optional[str] = None,
    ) -> List[FragmentFeatures]:
        return [self.extract_features(f, image_path) for f in fragments]
