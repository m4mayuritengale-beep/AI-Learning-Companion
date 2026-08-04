import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

try:
    from app.database.session import get_db
    from app.models.domain import User, UserProgress, QuizAttempt, Course, LearningPath
    from app.schemas.schemas import LearningPathRequest, LearningPathOut
    from app.middleware.auth import get_current_user
    from app.services.ai_service import ai_service
except ModuleNotFoundError:
    from database.session import get_db
    from models.domain import User, UserProgress, QuizAttempt, Course, LearningPath
    from schemas.schemas import LearningPathRequest, LearningPathOut
    from middleware.auth import get_current_user
    from services.ai_service import ai_service

logger = logging.getLogger("app")

router = APIRouter(prefix="/progress", tags=["Analytics & Learning Paths"])

@router.get("/stats")
def get_user_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total_courses = db.query(Course).count()
    user_progs = db.query(UserProgress).filter(UserProgress.user_id == current_user.id).all()
    avg_progress = round(sum(p.progress_pct for p in user_progs) / len(user_progs), 1) if user_progs else 0.0

    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == current_user.id).all()
    avg_quiz_score = round(sum(a.score for a in attempts) / len(attempts), 1) if attempts else 0.0

    ai_score = min(100.0, round(avg_progress * 0.5 + avg_quiz_score * 0.5, 1))

    return {
        "user_id": current_user.id,
        "total_courses": total_courses,
        "avg_progress": avg_progress,
        "avg_quiz_score": avg_quiz_score,
        "ai_score": ai_score,
        "active_streak_days": 5
    }

@router.get("/chart")
def get_progress_chart(current_user: User = Depends(get_current_user)):
    return [
        {"day": "Mon", "study_hours": 1.5, "quiz_score": 78.0},
        {"day": "Tue", "study_hours": 2.0, "quiz_score": 85.0},
        {"day": "Wed", "study_hours": 3.2, "quiz_score": 92.0},
        {"day": "Thu", "study_hours": 2.5, "quiz_score": 88.0},
        {"day": "Fri", "study_hours": 4.0, "quiz_score": 95.0},
        {"day": "Sat", "study_hours": 3.5, "quiz_score": 91.0},
        {"day": "Sun", "study_hours": 2.8, "quiz_score": 94.0},
    ]

@router.post("/learning-path", response_model=LearningPathOut)
@router.post("/generate", response_model=LearningPathOut)
def generate_learning_path(req: LearningPathRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        skill_lvl = req.current_skill_level or req.skill_level or "Intermediate"
        logger.info("Generating learning path for User ID %d: goal='%s', skill_level='%s'", current_user.id, req.goal, skill_lvl)

        path_data = ai_service.generate_learning_path(req.goal, current_skill_level=skill_lvl)

        title = path_data.get("title") or f"Roadmap: {req.goal}"
        roadmap_json_str = json.dumps(path_data)

        db_path = LearningPath(
            user_id=current_user.id,
            title=title,
            goal=req.goal,
            roadmap_json=roadmap_json_str
        )
        db.add(db_path)
        db.commit()
        db.refresh(db_path)

        logger.info("Saved learning path ID %d to database for User ID %d", db_path.id, current_user.id)

        return LearningPathOut(
            id=db_path.id,
            title=db_path.title,
            goal=db_path.goal,
            steps=path_data.get("steps", []),
            created_at=db_path.created_at
        )
    except Exception as e:
        logger.error("Error generating learning path for User ID %d: %s", current_user.id, str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate learning path: {str(e)}"
        )

@router.get("/my-paths", response_model=List[LearningPathOut])
@router.get("/learning-paths", response_model=List[LearningPathOut])
def get_my_learning_paths(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        paths = db.query(LearningPath).filter(LearningPath.user_id == current_user.id).order_by(LearningPath.created_at.desc()).all()
        result = []
        for p in paths:
            try:
                data = json.loads(p.roadmap_json)
                steps = data.get("steps", [])
            except Exception:
                steps = []
            result.append(LearningPathOut(
                id=p.id,
                title=p.title,
                goal=p.goal,
                steps=steps,
                created_at=p.created_at
            ))
        return result
    except Exception as e:
        logger.error("Error fetching learning paths for User ID %d: %s", current_user.id, str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch learning paths: {str(e)}"
        )

@router.get("/recommendations")
def get_recommendations(current_user: User = Depends(get_current_user)):
    return [
        {
            "id": 1,
            "title": "Deep Learning & Neural Networks",
            "category": "Artificial Intelligence",
            "reason": "Recommended based on your high accuracy in Machine Learning Fundamentals."
        },
        {
            "id": 2,
            "title": "Natural Language Processing with Transformers",
            "category": "NLP & LLMs",
            "reason": "Recommended based on your recent PDF document uploads."
        }
    ]
