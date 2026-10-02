import sys
import json

sys.path.insert(0, r"..\backend")

from scanners.checkov_scanner import run_checkov
from scanners.normalizer import normalize_checkov_results

from ai_adapter import analyze_normalized_finding


print("\n========================================")
print("       INFRAGUARD FULL AI TEST")
print("========================================")


# --------------------------------------------------
# 1. Run Checkov
# --------------------------------------------------

print("\n[1] Running Checkov...")

raw_output = run_checkov(r"..\sample_iac")

print("Checkov completed successfully.")


# --------------------------------------------------
# 2. Convert JSON string to Python dictionary
# --------------------------------------------------

print("\n[2] Parsing Checkov output...")

raw_results = json.loads(raw_output)

print("JSON parsed successfully.")


# --------------------------------------------------
# 3. Normalize Checkov findings
# --------------------------------------------------

print("\n[3] Normalizing findings...")

findings = normalize_checkov_results(raw_results)

print(f"Normalized findings: {len(findings)}")


# --------------------------------------------------
# 4. Send every finding to AI
# --------------------------------------------------

print("\n[4] Running AI analysis...")

for index, finding in enumerate(findings, start=1):

    print("\n----------------------------------------")
    print(f"FINDING {index}/{len(findings)}")
    print("----------------------------------------")

    print(f"Rule: {finding['check_id']}")
    print(f"Title: {finding['title']}")
    print(f"File: {finding['file']}")

    result = analyze_normalized_finding(finding)

    print("\n[AI ANALYSIS]")

    print(
        f"Explanation: "
        f"{result['ai_analysis']['explanation']}"
    )

    print(
        f"Risk: "
        f"{result['ai_analysis']['risk']}"
    )

    print(
        f"Impact: "
        f"{result['ai_analysis']['impact']}"
    )

    print(
        f"Recommendation: "
        f"{result['ai_analysis']['recommendation']}"
    )


print("\n========================================")
print("       FULL AI TEST COMPLETED")
print("========================================")