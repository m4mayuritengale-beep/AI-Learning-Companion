from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

try:
    from app.database.session import get_db
    from app.models.domain import User, Course, Lesson, UserProgress
    from app.schemas.schemas import CourseOut, CourseDetailOut, LessonOut
    from app.middleware.auth import get_current_user
except ModuleNotFoundError:
    from database.session import get_db
    from models.domain import User, Course, Lesson, UserProgress
    from schemas.schemas import CourseOut, CourseDetailOut, LessonOut
    from middleware.auth import get_current_user

router = APIRouter(prefix="/courses", tags=["Courses & Lessons"])

@router.get("/", response_model=List[CourseOut])
def list_courses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    result = []
    for c in courses:
        prog = db.query(UserProgress).filter(
            UserProgress.user_id == current_user.id,
            UserProgress.course_id == c.id
        ).first()
        pct = prog.progress_pct if prog else 0.0
        course_dict = CourseOut.model_validate(c)
        course_dict.progress_pct = pct
        result.append(course_dict)
    return result

@router.get("/{course_id}", response_model=CourseDetailOut)
def get_course_details(course_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
    
    prog = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.course_id == course_id
    ).first()
    pct = prog.progress_pct if prog else 0.0

    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.order_index).all()
    
    out = CourseDetailOut(
        id=course.id,
        title=course.title,
        description=course.description,
        category=course.category,
        level=course.level,
        image_url=course.image_url,
        progress_pct=pct,
        lessons=[LessonOut.model_validate(l) for l in lessons]
    )
    return out

@router.post("/lessons/{lesson_id}/complete")
def complete_lesson(lesson_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")
    
    total_lessons = db.query(Lesson).filter(Lesson.course_id == lesson.course_id).count() or 1
    
    prog = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.course_id == lesson.course_id
    ).first()

    if not prog:
        prog = UserProgress(
            user_id=current_user.id,
            course_id=lesson.course_id,
            completed_lessons=1,
            total_lessons=total_lessons,
            progress_pct=round((1 / total_lessons) * 100, 1)
        )
        db.add(prog)
    else:
        if prog.completed_lessons < total_lessons:
            prog.completed_lessons += 1
            prog.progress_pct = round((prog.completed_lessons / total_lessons) * 100, 1)
    
    db.commit()
    return {"message": "Lesson marked completed", "progress_pct": prog.progress_pct}
