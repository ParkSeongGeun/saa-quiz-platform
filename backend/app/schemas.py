from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserCreate(BaseModel):
    username: str
    password: str
    email: EmailStr  # EmailStr을 사용하여 자동 검증 (@ 유무 등)

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Question Schemas
class OptionResponse(BaseModel):
    id: int
    label: str
    content: str
    is_answer: bool
    class Config:
        from_attributes = True

class QuestionListResponse(BaseModel):
    id: int
    question: str
    domain: Optional[str]
    is_solved: bool = False
    last_submission_correct: Optional[bool] = None
    class Config:
        from_attributes = True

class QuestionDetailResponse(BaseModel):
    id: int
    question: str
    explanation: Optional[str]
    domain: Optional[str]
    options: List[OptionResponse]
    is_flagged: bool = False
    last_submission_correct: Optional[bool] = None
    class Config:
        from_attributes = True

# Submit Schemas
class SubmissionRequest(BaseModel):
    question_id: int
    selected_labels: List[str]

class SubmissionResponse(BaseModel):
    is_correct: bool
    correct_labels: List[str]
    explanation: Optional[str] = None

# Flag Schemas
class FlagRequest(BaseModel):
    question_id: int

class FlagResponse(BaseModel):
    user_id: int
    question_id: int
    class Config:
        from_attributes = True

# Tip Schemas
class TipRequest(BaseModel):
    question_id: int
    tip_text: str

class TipResponse(BaseModel):
    question_id: int
    tip_text: str
    updated_at: datetime
    question_text: Optional[str] = None
    domain: Optional[str] = None
    class Config:
        from_attributes = True
