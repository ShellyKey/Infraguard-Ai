import sys
import json
from pathlib import Path

# Allow Python to locate the root-level ai folder
sys.path.append(str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI, HTTPException

from scanners.checkov_scanner import run_checkov
from scanners.normalizer import normalize_checkov_results
from ai.analyzer import analyze_findings

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
        # 1. Run Checkov
        result = run_checkov(str(iac_path))

        # 2. Parse Checkov JSON
        raw_findings = json.loads(result)

        # 3. Normalize Checkov findings
        findings = normalize_checkov_results(raw_findings)

        # 4. Analyze findings using the AI module
        analyzed_findings = analyze_findings(findings)

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