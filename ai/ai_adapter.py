from ai.analyzer import analyze_with_ai


def prepare_finding(normalized_finding):
    """
    Convert the team's normalized Checkov finding
    into the format expected by the AI analyzer.
    """

    return {
        "scanner": "Checkov",
        "rule_id": normalized_finding.get(
            "check_id",
            "UNKNOWN"
        ),
        "severity": normalized_finding.get(
            "severity",
            "UNKNOWN"
        ),
        "title": normalized_finding.get(
            "title",
            "Security issue detected"
        ),
        "file": normalized_finding.get(
            "file",
            "Unknown file"
        ),
        "line": None,
    }


def analyze_normalized_finding(normalized_finding):
    """
    Analyze a normalized Checkov finding using
    the InfraGuard AI analysis pipeline.
    """

    finding = prepare_finding(normalized_finding)

    return analyze_with_ai(finding)