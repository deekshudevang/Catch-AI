
from typing import List
from .models import Fragment, FragmentFeatures, FragmentRelationship

class RelationshipScorer:
    def score(self, frag_a: Fragment, feat_a: FragmentFeatures, frag_b: Fragment, feat_b: FragmentFeatures) -> List[FragmentRelationship]:
        relationships = []

        data_a = frag_a.data if hasattr(frag_a, "data") and frag_a.data else b""
        data_b = frag_b.data if hasattr(frag_b, "data") and frag_b.data else b""

        # Format-specific exact structural rules

        # PNG Validation
        if data_a.startswith(b"\x89PNG\r\n\x1a\n") and b"IHDR" in data_a:
            if b"IDAT" in data_b:
                relationships.append(FragmentRelationship(
                    source_id=frag_a.id,
                    target_id=frag_b.id,
                    relationship_type="structural",
                    evidence="PNG IHDR fragment precedes IDAT fragment",
                    method="structural"
                ))
        if b"IDAT" in data_a and b"IEND" in data_b:
            relationships.append(FragmentRelationship(
                source_id=frag_a.id,
                target_id=frag_b.id,
                relationship_type="structural",
                evidence="PNG IDAT fragment precedes IEND fragment",
                method="structural"
            ))

        # JPEG Validation
        if data_a.startswith(b"\xff\xd8"): # SOI
            if b"\xff\xda" in data_b or b"\xff\xd9" in data_b:
                relationships.append(FragmentRelationship(
                    source_id=frag_a.id,
                    target_id=frag_b.id,
                    relationship_type="structural",
                    evidence="JPEG SOI fragment precedes scan/EOI data",
                    method="structural"
                ))

        # PDF Validation
        if data_a.startswith(b"%PDF-"):
            if b"%%EOF" in data_b or b"xref" in data_b or b"trailer" in data_b:
                relationships.append(FragmentRelationship(
                    source_id=frag_a.id,
                    target_id=frag_b.id,
                    relationship_type="structural",
                    evidence="PDF header precedes xref/trailer/EOF",
                    method="structural"
                ))

        return relationships

    def score_all(self, fragments: List[Fragment], features: List[FragmentFeatures], max_edges: int = 2000) -> List[FragmentRelationship]:
        relationships = []
        n = len(fragments)
        for i in range(n):
            for j in range(n):
                if i == j: continue
                rels = self.score(fragments[i], features[i], fragments[j], features[j])
                relationships.extend(rels)
        return relationships
