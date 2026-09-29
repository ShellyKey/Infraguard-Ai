
def normalize_checkov_results(raw_results):
    """
    Convert raw Checkov JSON into a clean list of failed findings.
    """

    normalized_findings = []

    failed_checks = raw_results.get("results", {}).get("failed_checks", [])

    for result in failed_checks:
        finding = {
            "check_id": result.get("check_id", "UNKNOWN"),
            "title": result.get("check_name", "Security issue detected"),
            "resource": result.get("resource", "Unknown resource"),
            "severity": result.get("severity") or "UNKNOWN",
            "status": "FAILED",
            "file": result.get("file_path", "Unknown file"),
            "guideline": result.get("guideline", ""),
        }

        normalized_findings.append(finding)

    return normalized_findings