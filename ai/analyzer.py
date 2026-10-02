from ai.agents.security_agent import analyze_finding as ai_analyze_finding
def analyze_finding(finding):
    """
    Analyze a normalized security finding and add
    severity, explanation, impact, and remediation.
    """

    check_id = finding.get("rule_id", "UNKNOWN")
    title = finding.get("title", "Security issue detected")

    # Initial severity mapping
    severity_map = {
        "CKV_AWS_53": "HIGH",
        "CKV_AWS_54": "HIGH",
        "CKV_AWS_55": "HIGH",
        "CKV_AWS_56": "HIGH",
        "CKV2_AWS_6": "HIGH",
        "CKV_AWS_145": "HIGH",
        "CKV_AWS_21": "MEDIUM",
        "CKV_AWS_18": "MEDIUM",
        "CKV2_AWS_61": "MEDIUM",
        "CKV_AWS_144": "MEDIUM",
        "CKV2_AWS_62": "MEDIUM",
    }

    severity = severity_map.get(check_id, "UNKNOWN")

    # Simple explanations
    explanation_map = {
        "CKV_AWS_53": "The S3 bucket does not block public access through ACLs.",
        "CKV_AWS_54": "The S3 bucket does not block public bucket policies.",
        "CKV_AWS_55": "The S3 bucket does not ignore public ACLs.",
        "CKV_AWS_56": "The S3 bucket does not restrict public access.",
        "CKV2_AWS_6": "The S3 bucket is missing effective public access protection.",
        "CKV_AWS_145": "The S3 bucket does not enforce encryption using AWS KMS.",
        "CKV_AWS_21": "S3 bucket versioning is not enabled.",
        "CKV_AWS_18": "S3 bucket access logging is not enabled.",
        "CKV2_AWS_61": "The S3 bucket does not have a lifecycle configuration.",
        "CKV_AWS_144": "Cross-region replication is not configured for the S3 bucket.",
        "CKV2_AWS_62": "S3 bucket event notifications are not configured.",
    }

    impact_map = {
        "CKV_AWS_53": "Public ACLs may expose stored data to unauthorized users.",
        "CKV_AWS_54": "An overly permissive bucket policy may expose sensitive data.",
        "CKV_AWS_55": "Public ACL permissions may allow unintended access to objects.",
        "CKV_AWS_56": "Public bucket access may expose data to unauthorized users.",
        "CKV2_AWS_6": "Missing public access protections may increase the risk of data exposure.",
        "CKV_AWS_145": "Data may not meet encryption requirements or organizational security policies.",
        "CKV_AWS_21": "Accidental deletion or overwriting may make data recovery difficult.",
        "CKV_AWS_18": "Limited access logs can make security investigations harder.",
        "CKV2_AWS_61": "Unmanaged object retention may increase storage costs.",
        "CKV_AWS_144": "A regional outage could affect data availability if no other recovery method exists.",
        "CKV2_AWS_62": "Important changes to bucket objects may not trigger automated workflows.",
    }

    remediation_map = {
        "CKV_AWS_53": "Set block_public_acls = true.",
        "CKV_AWS_54": "Set block_public_policy = true.",
        "CKV_AWS_55": "Set ignore_public_acls = true.",
        "CKV_AWS_56": "Set restrict_public_buckets = true.",
        "CKV2_AWS_6": "Configure an aws_s3_bucket_public_access_block resource with all public access protections enabled.",
        "CKV_AWS_145": "Configure server-side encryption using an AWS KMS key.",
        "CKV_AWS_21": "Enable versioning for the S3 bucket.",
        "CKV_AWS_18": "Configure S3 server access logging.",
        "CKV2_AWS_61": "Add an S3 lifecycle configuration appropriate for the bucket's data.",
        "CKV_AWS_144": "Configure cross-region replication if required by your availability and recovery objectives.",
        "CKV2_AWS_62": "Configure S3 event notifications for the required events.",
    }

    return {
        **finding,
        "severity": severity,
        "explanation": explanation_map.get(
            check_id,
            f"Security check failed: {title}"
        ),
        "impact": impact_map.get(
            check_id,
            "Review this finding to understand its potential security impact."
        ),
        "remediation": remediation_map.get(
            check_id,
            "Review the Checkov guideline and apply the recommended fix."
        ),
    }


def analyze_findings(findings):
    """
    Analyze a list of normalized findings.
    """

    return [
        analyze_finding(finding)
        for finding in findings
    ]

def analyze_with_ai(finding):
    """
    Perform both rule-based and AI-powered analysis.
    """

    rule_analysis = analyze_finding(finding)

    ai_analysis = ai_analyze_finding(finding)

    return {
        **rule_analysis,
        "ai_analysis": ai_analysis.model_dump()
    }