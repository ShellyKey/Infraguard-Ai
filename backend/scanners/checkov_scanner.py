import subprocess

CHECKOV_PATH = r"D:\Infraguard\backend\venv\Scripts\checkov.cmd"


def run_checkov(iac_path):
    result = subprocess.run(
        [
            "cmd.exe",
            "/c",
            CHECKOV_PATH,
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