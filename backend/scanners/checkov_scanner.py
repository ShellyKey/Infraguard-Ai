import os
import subprocess
import sys


def run_checkov(iac_path):
    """
    Run Checkov against the supplied IaC directory
    using the current Python virtual environment.
    """

    checkov_path = os.path.join(
        os.path.dirname(sys.executable),
        "checkov.cmd"
    )

    if not os.path.exists(checkov_path):
        raise RuntimeError(
            f"Checkov executable not found at:\n{checkov_path}"
        )

    result = subprocess.run(
        [
            checkov_path,
            "-d",
            iac_path,
            "--output",
            "json"
        ],
        capture_output=True,
        text=True
    )

    if result.returncode not in (0, 1):
        raise RuntimeError(
            f"Checkov failed:\n{result.stderr}"
        )

    return result.stdout