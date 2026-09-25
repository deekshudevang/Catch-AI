def score_relationship(frag_a: dict, frag_b: dict) -> dict:
    score = 0.0
    reasons = []

    # 1. Physical adjacency
    if frag_a["offset"] + frag_a["length"] == frag_b["offset"]:
        score += 0.4
        reasons.append("physical adjacency")

    # 2. Entropy continuity (similar entropy)
    ent_diff = abs(frag_a["entropy"] - frag_b["entropy"])
    if ent_diff < 1.0:
        score += 0.3
        reasons.append(f"compatible entropy profile (diff {ent_diff:.2f})")
        
    # 3. File type compatibility
    # If frag_a has a specific file type and frag_b is unknown or same, it's good.
    if frag_a["file_type"] != "UNKNOWN" and frag_b["file_type"] in ["UNKNOWN", frag_a["file_type"]]:
        score += 0.2
        reasons.append("compatible file type context")

    return {
        "fragment_a": frag_a["id"],
        "fragment_b": frag_b["id"],
        "relationship_score": round(score, 2),
        "reasons": reasons
    }
