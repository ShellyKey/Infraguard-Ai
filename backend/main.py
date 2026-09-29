
import json
from pathlib import Path

from fastapi import FastAPI, HTTPException

from scanners.checkov_scanner import run_checkov
from scanners.normalizer import normalize_checkov_results

app = FastAPI()


@app.get("/")
def home():
    return {
        "message": "InfraGuard AI is running!"
    }


@app.get("/scan")
def scan():
    iac_path = Path("../sample_iac").resolve()

    try:
        result = run_checkov(str(iac_path))
        raw_findings = json.loads(result)

        findings = normalize_checkov_results(raw_findings)

        return {
    "status": "success",
    "message": "Scan completed successfully!",
    "total_findings": len(findings),
    "findings": findings
}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )