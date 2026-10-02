from typing import Optional
from pydantic import BaseModel


class SecurityFinding(BaseModel):
    scanner: str
    rule_id: str
    severity: str
    title: str
    file: Optional[str] = None
    line: Optional[int] = None


class AIAnalysis(BaseModel):
    explanation: str
    risk: str
    impact: str
    recommendation: str