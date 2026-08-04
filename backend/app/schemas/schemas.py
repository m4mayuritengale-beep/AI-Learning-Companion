from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr, Field

# Authentication & User Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[int] = None

# User Goal Schemas
class UserGoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    target_date: Optional[str] = None

class UserGoalOut(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    target_date: Optional[str]
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Course & Lesson Schemas
class LessonOut(BaseModel):
    id: int
    course_id: int
    title: str
    content: str
    order_index: int
    duration_mins: int

    class Config:
        from_attributes = True

class CourseOut(BaseModel):
    id: int
    title: str
    description: str
    category: str
    level: str
    image_url: Optional[str]
    progress_pct: Optional[float] = 0.0

    class Config:
        from_attributes = True

class CourseDetailOut(CourseOut):
    lessons: List[LessonOut] = []

# AI Chat Schemas
class ChatMessageCreate(BaseModel):
    session_id: Optional[int] = None
    message: str

class ChatMessageOut(BaseModel):
    id: int
    sender: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionOut(BaseModel):
    id: int
    title: str
    created_at: datetime
    messages: List[ChatMessageOut] = []

    class Config:
        from_attributes = True

class ConceptExplainRequest(BaseModel):
    concept: str
    depth: Optional[str] = "beginner"  # beginner, intermediate, advanced

# Quiz Schemas
class QuizQuestionOut(BaseModel):
    id: int
    question_text: str
    options: List[str]
    explanation: Optional[str] = None

    class Config:
        from_attributes = True

class QuizOut(BaseModel):
    id: int
    title: str
    topic: str
    questions: List[QuizQuestionOut] = []

    class Config:
        from_attributes = True

class QuizQuestionAnswer(BaseModel):
    question_id: int
    selected_option: str

class QuizSubmitRequest(BaseModel):
    answers: List[QuizQuestionAnswer]

class QuizSubmitResult(BaseModel):
    score: float
    total_questions: int
    percentage: float
    passed: bool
    details: List[dict]

class QuizAttemptOut(BaseModel):
    id: int
    quiz_id: int
    quiz_title: Optional[str] = None
    score: float
    total_questions: int
    attempted_at: datetime

    class Config:
        from_attributes = True

# PDF & Learning Path Schemas
class DocumentOut(BaseModel):
    id: int
    filename: str
    uploaded_at: datetime
    summary: Optional[str]

    class Config:
        from_attributes = True

class LearningPathRequest(BaseModel):
    goal: str
    skill_level: Optional[str] = "Intermediate"
    current_skill_level: Optional[str] = "Intermediate"

# Alias for backward compatibility
LearningPathCreate = LearningPathRequest

class LearningPathStep(BaseModel):
    step_number: int
    title: str
    description: str
    estimated_weeks: int
    topics: List[str]

class LearningPathOut(BaseModel):
    id: int
    title: str
    goal: str
    steps: List[dict] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Stats & Analytics Schemas
class StatsOut(BaseModel):
    total_courses: int
    avg_progress: float
    avg_quiz_score: float
    ai_score: int
    active_streak_days: int

class ProgressChartItem(BaseModel):
    day: str
    study_hours: float
    quiz_score: float

class RecommendationItem(BaseModel):
    id: int
    title: str
    category: str
    reason: str
