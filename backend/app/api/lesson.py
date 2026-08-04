from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

try:
    from app.database.session import get_db
    from app.models.domain import Lesson, User
    from app.schemas.schemas import LessonOut
    from app.middleware.auth import get_current_user
except ModuleNotFoundError:
    from database.session import get_db
    from models.domain import Lesson, User
    from schemas.schemas import LessonOut
    from middleware.auth import get_current_user

router = APIRouter(prefix="/lessons", tags=["Lessons"])

@router.get("/course/{course_id}", response_model=List[LessonOut])
def get_lessons_by_course(course_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.order_index).all()
    return lessons

@router.get("/{lesson_id}", response_model=LessonOut)
def get_lesson(lesson_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")
    return lesson
