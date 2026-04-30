import re

EXPECTED_ARTICLE_COUNTS = {
    "family_code": 400,
    "labor_code": 589,
    "penal_code": 767,
    "civil_procedure": 528,
    "obligations_contracts": 1237,
    "criminal_procedure": 751,
    "commerce_code": 738,
    "urbanism_code": 120,
}


def _parse_num(article_number: str) -> int:
    """Parse article number to int; handles '173-1' style by taking first part."""
    try:
        return int(article_number.split("-")[0])
    except (ValueError, AttributeError):
        return -1


def validate(articles: list[dict], law_code: str) -> list[str]:
    issues = []

    # 1. Count check
    expected = EXPECTED_ARTICLE_COUNTS.get(law_code)
    if expected and abs(len(articles) - expected) > 5:
        issues.append(
            f"⚠️ Expected ~{expected} articles, got {len(articles)}"
        )

    # 2. Sequential numbering
    for i in range(len(articles) - 1):
        curr = _parse_num(articles[i]["articleNumber"])
        next_ = _parse_num(articles[i + 1]["articleNumber"])
        if curr >= 0 and next_ >= 0 and next_ != curr + 1:
            issues.append(f"⚠️ Gap: Art {curr} → Art {next_}")
            articles[i + 1]["quality"] = "needs_review"

    # 3. Minimum text length
    for a in articles:
        if len(a["text"].strip()) < 20:
            a["quality"] = "corrupted"
            issues.append(f"⚠️ Art {a['articleNumber']}: too short")

    # 4. Arabic presence
    for a in articles:
        if not re.search(r"[\u0600-\u06FF]{5,}", a["text"]):
            a["quality"] = "corrupted"
            issues.append(f"⚠️ Art {a['articleNumber']}: no Arabic text")

    # 5. Suspicious number sequences (page numbers bleeding in)
    for a in articles:
        if re.search(r"\b\d{4,}\b", a["text"]):
            if a["quality"] == "pending":
                a["quality"] = "needs_review"
            issues.append(
                f"⚠️ Art {a['articleNumber']}: suspicious number sequence"
            )

    # Mark remaining articles as clean
    for a in articles:
        if a["quality"] == "pending":
            a["quality"] = "clean"

    return issues
