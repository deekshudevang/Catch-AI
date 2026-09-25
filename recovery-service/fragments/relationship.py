"""
Relationship Scorer — computes pairwise relationship scores between fragments.

Scoring heuristics (all deterministic, based on real fragment features):

1. Sequential proximity   : fragments at adjacent byte offsets score high.
2. Entropy similarity     : fragments with similar entropy suggest same data region.
3. File-type continuity   : header → body → footer within same file type boosts score.
4. Byte-mean continuity   : similar mean byte values suggest data continuity.
5. Run-length similarity  : similar compression/pattern structure.

Score is the weighted sum of these sub-scores, clamped to [0, 1].
"""

import math
from typing import List, Tuple
from .models import Fragment, FragmentFeatures, FragmentRelationship

# Weight constants
W_PROXIMITY   = 0.35
W_ENTROPY     = 0.25
W_FILE_TYPE   = 0.20
W_MEAN_BYTE   = 0.10
W_RUN_LENGTH  = 0.10

# Fragment type transition bonus table
TYPE_TRANSITION_BONUS = {
    ("header", "body"):   0.9,
    ("body",   "body"):   0.7,
    ("body",   "footer"): 0.9,
    ("header", "footer"): 0.6,
    ("orphan", "body"):   0.3,
    ("orphan", "orphan"): 0.2,
}

# Minimum score to create an edge (prune weak edges)
MIN_EDGE_SCORE = 0.40


def _proximity_score(a: Fragment, b: Fragment, max_gap: int = 65536) -> float:
    """Score based on byte offset distance. Adjacent = 1.0, max_gap = 0.0."""
    gap = abs(b.offset - (a.offset + a.length))
    if gap == 0:
        return 1.0
    return max(0.0, 1.0 - gap / max_gap)


def _entropy_score(fa: FragmentFeatures, fb: FragmentFeatures) -> float:
    """High score when entropies are similar (same region)."""
    diff = abs(fa.entropy - fb.entropy)
    return max(0.0, 1.0 - diff / 8.0)


def _file_type_score(fa: FragmentFeatures, fb: FragmentFeatures) -> float:
    """Score based on file type continuity."""
    # Same explicit hint → strong continuity
    if fa.file_type_hint and fb.file_type_hint:
        if fa.file_type_hint == fb.file_type_hint:
            return 0.9
        return 0.1

    key = (fa.fragment_type, fb.fragment_type)
    return TYPE_TRANSITION_BONUS.get(key, 0.1)


def _mean_byte_score(fa: FragmentFeatures, fb: FragmentFeatures) -> float:
    diff = abs(fa.mean_byte_value - fb.mean_byte_value)
    return max(0.0, 1.0 - diff / 255.0)


def _run_length_score(fa: FragmentFeatures, fb: FragmentFeatures) -> float:
    max_rl = max(fa.run_length, fb.run_length, 1)
    diff = abs(fa.run_length - fb.run_length)
    return max(0.0, 1.0 - diff / max_rl)


def _relationship_type(fa: FragmentFeatures, fb: FragmentFeatures, score: float) -> str:
    if fa.file_type_hint and fa.file_type_hint == fb.file_type_hint:
        return "signature_match"
    if fa.fragment_type == "header" and fb.fragment_type in ("body", "footer"):
        return "sequential"
    if fb.fragment_type == "footer" and fa.fragment_type == "body":
        return "sequential"
    if abs(fa.entropy - fb.entropy) < 0.5:
        return "entropy_match"
    return "referenced"


class RelationshipScorer:
    """Scores pairwise fragment relationships. O(n²) — suitable up to ~500 fragments."""

    def score(
        self,
        frag_a: Fragment,
        feat_a: FragmentFeatures,
        frag_b: Fragment,
        feat_b: FragmentFeatures,
    ) -> float:
        ps = _proximity_score(frag_a, frag_b)
        es = _entropy_score(feat_a, feat_b)
        fs = _file_type_score(feat_a, feat_b)
        ms = _mean_byte_score(feat_a, feat_b)
        rs = _run_length_score(feat_a, feat_b)

        return round(
            W_PROXIMITY * ps +
            W_ENTROPY   * es +
            W_FILE_TYPE * fs +
            W_MEAN_BYTE * ms +
            W_RUN_LENGTH * rs,
            4,
        )

    def score_all(
        self,
        fragments: List[Fragment],
        features: List[FragmentFeatures],
        max_edges: int = 2000,
    ) -> List[FragmentRelationship]:
        """
        Compute all pairwise scores. Only fragments within a 10-index
        window are compared for efficiency. Edges below MIN_EDGE_SCORE are pruned.
        """
        relationships: List[FragmentRelationship] = []
        n = len(fragments)
        window = 10  # compare each fragment only to its 10 nearest neighbours

        for i in range(n):
            for j in range(i + 1, min(i + window + 1, n)):
                frag_a, feat_a = fragments[i], features[i]
                frag_b, feat_b = fragments[j], features[j]

                s = self.score(frag_a, feat_a, frag_b, feat_b)
                if s >= MIN_EDGE_SCORE:
                    rel_type = _relationship_type(feat_a, feat_b, s)
                    relationships.append(FragmentRelationship(
                        source_id=frag_a.id,
                        target_id=frag_b.id,
                        score=s,
                        relationship_type=rel_type,
                    ))
                    if len(relationships) >= max_edges:
                        return relationships

        return relationships
