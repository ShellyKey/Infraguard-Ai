import json
from pathlib import Path

from fastapi import FastAPI, HTTPException

from backend.scanners.checkov_scanner import run_checkov
from backend.scanners.normalizer import normalize_checkov_results

from ai.ai_adapter import analyze_normalized_finding


app = FastAPI()


@app.get("/")
def home():
    return {
        "message": "InfraGuard AI is running!"
    }


@app.get("/scan")
def scan():
    iac_path = (
        Path(__file__).resolve().parent.parent / "sample_iac"
    ).resolve()

    try:
        # --------------------------------------------------
        # 1. Run Checkov
        # --------------------------------------------------

        result = run_checkov(str(iac_path))

        # --------------------------------------------------
        # 2. Parse Checkov JSON
        # --------------------------------------------------

        raw_findings = json.loads(result)

        # --------------------------------------------------
        # 3. Normalize Checkov findings
        # --------------------------------------------------

        findings = normalize_checkov_results(raw_findings)

        # --------------------------------------------------
        # 4. Run AI analysis for every finding
        # --------------------------------------------------

        analyzed_findings = []

        for finding in findings:

            analysis = analyze_normalized_finding(finding)

            analyzed_findings.append({
                **finding,
                "ai_analysis": analysis["ai_analysis"]
            })

        # --------------------------------------------------
        # 5. Return final response
        # --------------------------------------------------

        return {
            "status": "success",
            "message": "Scan and AI analysis completed successfully!",
            "total_findings": len(analyzed_findings),
            "findings": analyzed_findings
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )