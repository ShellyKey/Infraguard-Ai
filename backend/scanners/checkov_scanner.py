import shutil
import subprocess


def run_checkov(iac_path):
    """
    Run Checkov against the supplied IaC directory.
    Works on both Windows and Linux/Docker environments.
    """

    checkov_path = shutil.which("checkov")

    if not checkov_path:
        checkov_path = shutil.which("checkov.cmd")

    if not checkov_path:
        raise RuntimeError(
            "Checkov executable not found. "
            "Make sure Checkov is installed and available in PATH."
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