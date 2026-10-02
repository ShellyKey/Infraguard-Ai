import os
import json

from groq import Groq

from ai.schemas import AIAnalysis


def analyze_finding(finding):
    """
    Analyze a security finding using Groq AI
    and return a validated AIAnalysis object.
    """

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY environment variable is not set."
        )

    client = Groq(api_key=api_key)

    prompt = f"""
You are an expert cloud security engineer.

Analyze the following infrastructure security finding.

Security Finding:
{json.dumps(finding, indent=2)}

Provide a concise security analysis.

Return ONLY valid JSON in exactly this format:

{{
    "explanation": "Explain what the security issue means.",
    "risk": "Explain the security risk.",
    "impact": "Explain the potential impact.",
    "recommendation": "Explain how to fix the issue."
}}

Do not include markdown.
Do not include ```json.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "system",
                "content": "You are a professional cloud security analyst."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
    )

    content = response.choices[0].message.content

    try:
        result = json.loads(content)
    except json.JSONDecodeError:
        raise ValueError(
            f"Groq returned invalid JSON:\n{content}"
        )

    return AIAnalysis(**result)