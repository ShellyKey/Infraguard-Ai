import subprocess


def run_checkov(iac_path):
    result = subprocess.run(
        ["checkov", "-d", iac_path, "--output", "json"],
        capture_output=True,
        text=True
    )

    return result.stdout