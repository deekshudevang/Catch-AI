"""
Format-aware relationship scoring for fragment reconstruction.

Every scored relationship has:
  - score: 0.0–1.0
  - reasons: human-readable list
  - evidence: machine-readable list

Only non-zero scores when actual structural evidence supports the
directed relationship A → B (A immediately precedes B).
"""


def detect_structural_markers(data: bytes) -> dict:
    """Detect format-specific structural markers in fragment binary data."""
    m = {
        "format_hints": set(),
        "is_start": False,
        "is_end": False,
        "details": {},
    }
    if not data:
        return m

    # ── PNG ──────────────────────────────────────────────────
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        m["format_hints"].add("PNG")
        m["is_start"] = True
        m["details"]["png_signature"] = True

    tail = data.rstrip(b"\x00")
    if tail[-8:] == b"IEND\xaeB`\x82" if len(tail) >= 8 else False:
        m["format_hints"].add("PNG")
        m["is_end"] = True
        m["details"]["png_iend_terminal"] = True

    for tag in (b"IHDR", b"IDAT", b"IEND", b"PLTE"):
        if tag in data:
            m["format_hints"].add("PNG")
            m["details"][f"png_{tag.decode().lower()}"] = True

    # ── JPEG ─────────────────────────────────────────────────
    if data[:3] == b"\xff\xd8\xff":
        m["format_hints"].add("JPEG")
        m["is_start"] = True
        m["details"]["jpeg_soi"] = True

    if len(data) >= 2 and data[-2:] == b"\xff\xd9":
        m["format_hints"].add("JPEG")
        m["is_end"] = True
        m["details"]["jpeg_eoi_terminal"] = True

    for marker, name in (
        (b"\xff\xe0", "app0"), (b"\xff\xe1", "app1"),
        (b"\xff\xdb", "dqt"),  (b"\xff\xc0", "sof0"),
        (b"\xff\xc4", "dht"),  (b"\xff\xda", "sos"),
    ):
        if marker in data:
            m["format_hints"].add("JPEG")
            m["details"][f"jpeg_{name}"] = True

    # ── PDF ──────────────────────────────────────────────────
    if data[:5] == b"%PDF-":
        m["format_hints"].add("PDF")
        m["is_start"] = True
        m["details"]["pdf_header"] = True

    stripped = data.rstrip(b"\r\n\x00 ")
    if len(stripped) >= 5 and stripped[-5:] == b"%%EOF":
        m["format_hints"].add("PDF")
        m["is_end"] = True
        m["details"]["pdf_eof_terminal"] = True
    elif b"%%EOF" in data:
        m["format_hints"].add("PDF")
        m["details"]["pdf_eof_embedded"] = True

    if b"xref" in data:
        m["format_hints"].add("PDF")
        m["details"]["pdf_xref"] = True
    if b"trailer" in data:
        m["format_hints"].add("PDF")
        m["details"]["pdf_trailer"] = True

    return m


def score_relationship(frag_a: dict, frag_b: dict) -> dict:
    """
    Score the directed relationship frag_a → frag_b.

    Returns dict with relationship_score, reasons, evidence.
    """
    score = 0.0
    reasons = []
    evidence = []

    data_a = frag_a.get("data", b"")
    data_b = frag_b.get("data", b"")
    ma = detect_structural_markers(data_a)
    mb = detect_structural_markers(data_b)

    # ── Hard negatives: end→anything or anything→start ──────
    if ma["is_end"]:
        return _result(frag_a, frag_b, 0.0, [], [])
    if mb["is_start"]:
        return _result(frag_a, frag_b, 0.0, [], [])

    # ── PNG structural rules ─────────────────────────────────
    if ma["details"].get("png_signature"):
        if mb["details"].get("png_ihdr") or mb["details"].get("png_idat"):
            score += 0.92
            reasons.append("PNG: signature → IHDR/IDAT chunk sequence")
            evidence.append({"format": "PNG", "rule": "signature_sequence"})
        elif not mb["is_end"]:
            # start → body (no specific markers in B)
            conflicting_b = mb["format_hints"] - {"PNG"}
            if not conflicting_b:
                score += 0.6
                reasons.append("PNG: signature → body fragment")
                evidence.append({"format": "PNG", "rule": "start_body"})

    if ma["details"].get("png_idat") and mb["details"].get("png_iend_terminal"):
        score += 0.9
        reasons.append("PNG: IDAT data → IEND terminator")
        evidence.append({"format": "PNG", "rule": "idat_iend"})

    if (not ma["is_start"] and not ma["is_end"]
            and mb["details"].get("png_iend_terminal")):
        conflicting_a = ma["format_hints"] - {"PNG"}
        if not conflicting_a:
            score += 0.7
            reasons.append("PNG: body → IEND terminal")
            evidence.append({"format": "PNG", "rule": "body_iend"})

    # ── JPEG structural rules ────────────────────────────────
    if ma["details"].get("jpeg_soi"):
        table_markers = ("app0", "app1", "dqt", "sof0", "dht")
        if any(mb["details"].get(f"jpeg_{t}") for t in table_markers):
            score += 0.9
            reasons.append("JPEG: SOI → table/header markers")
            evidence.append({"format": "JPEG", "rule": "soi_tables"})

    if any(ma["details"].get(f"jpeg_{t}") for t in ("sos",)):
        if mb["details"].get("jpeg_eoi_terminal"):
            score += 0.85
            reasons.append("JPEG: SOS entropy data → EOI")
            evidence.append({"format": "JPEG", "rule": "sos_eoi"})

    if (not ma["is_start"] and not ma["is_end"]
            and mb["details"].get("jpeg_eoi_terminal")):
        conflicting_a = ma["format_hints"] - {"JPEG"}
        if not conflicting_a:
            score += 0.7
            reasons.append("JPEG: body → EOI terminal")
            evidence.append({"format": "JPEG", "rule": "body_eoi"})

    # ── PDF structural rules ─────────────────────────────────
    a_pdf_start = ma["details"].get("pdf_header", False)
    b_pdf_end = mb["details"].get("pdf_eof_terminal", False)

    if a_pdf_start and not b_pdf_end:
        score += 0.8
        reasons.append("PDF: header → body content")
        evidence.append({"format": "PDF", "rule": "header_body"})

    if a_pdf_start and b_pdf_end:
        score += 0.6
        reasons.append("PDF: header → %%EOF (direct)")
        evidence.append({"format": "PDF", "rule": "header_eof_direct"})

    if not ma["is_start"] and not ma["is_end"] and b_pdf_end:
        conflicting_a = ma["format_hints"] - {"PDF"}
        if not conflicting_a:
            score += 0.75
            reasons.append("PDF: body → %%EOF terminal")
            evidence.append({"format": "PDF", "rule": "body_eof"})

    if ma["details"].get("pdf_xref") and mb["details"].get("pdf_trailer"):
        score += 0.85
        reasons.append("PDF: xref → trailer")
        evidence.append({"format": "PDF", "rule": "xref_trailer"})

    if ma["details"].get("pdf_trailer") and b_pdf_end:
        score += 0.9
        reasons.append("PDF: trailer → %%EOF")
        evidence.append({"format": "PDF", "rule": "trailer_eof"})

    # ── Weak generic: entropy continuity ─────────────────────
    ent_a = frag_a.get("entropy", 0)
    ent_b = frag_b.get("entropy", 0)
    if ent_a and ent_b:
        ent_diff = abs(ent_a - ent_b)
        if ent_diff < 0.5:
            score += 0.05
            reasons.append(f"entropy continuity (Δ{ent_diff:.3f})")
            evidence.append({"type": "statistical", "metric": "entropy_diff",
                             "value": round(ent_diff, 4)})

    return _result(frag_a, frag_b, score, reasons, evidence)


def _result(a, b, score, reasons, evidence):
    return {
        "fragment_a": a["id"],
        "fragment_b": b["id"],
        "relationship_score": round(min(score, 1.0), 3),
        "reasons": reasons,
        "evidence": evidence,
    }
