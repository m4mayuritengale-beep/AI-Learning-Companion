import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

try:
    from app.database.session import get_db
    from app.models.domain import User, Quiz, QuizQuestion, QuizAttempt
    from app.schemas.schemas import QuizOut, QuizQuestionOut, QuizSubmitRequest, QuizSubmitResult, QuizAttemptOut
    from app.middleware.auth import get_current_user
    from app.services.ai_service import ai_service
except ModuleNotFoundError:
    from database.session import get_db
    from models.domain import User, Quiz, QuizQuestion, QuizAttempt
    from schemas.schemas import QuizOut, QuizQuestionOut, QuizSubmitRequest, QuizSubmitResult, QuizAttemptOut
    from middleware.auth import get_current_user
    from services.ai_service import ai_service

router = APIRouter(prefix="/quizzes", tags=["AI Quiz Engine"])

@router.post("/generate", response_model=QuizOut, status_code=status.HTTP_201_CREATED)
def generate_ai_quiz(topic: str, course_id: int = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    generated_questions = ai_service.generate_quiz(topic, num_questions=5)

    quiz = Quiz(
        course_id=course_id,
        title=f"AI Quiz: {topic}",
        topic=topic,
        created_by=current_user.id
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    q_models = []
    for q in generated_questions:
        q_obj = QuizQuestion(
            quiz_id=quiz.id,
            question_text=q.get("question_text", "Question"),
            options=json.dumps(q.get("options", [])),
            correct_answer=q.get("correct_answer", ""),
            explanation=q.get("explanation", "")
        )
        db.add(q_obj)
        q_models.append(q_obj)

    db.commit()

    questions_out = []
    for q in q_models:
        questions_out.append(
            QuizQuestionOut(
                id=q.id,
                question_text=q.question_text,
                options=json.loads(q.options),
                explanation=q.explanation
            )
        )

    return QuizOut(id=quiz.id, title=quiz.title, topic=quiz.topic, questions=questions_out)

@router.get("/{quiz_id}", response_model=QuizOut)
def get_quiz(quiz_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found.")
    
    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).all()
    questions_out = []
    for q in questions:
        questions_out.append(
            QuizQuestionOut(
                id=q.id,
                question_text=q.question_text,
                options=json.loads(q.options),
                explanation=q.explanation
            )
        )

    return QuizOut(id=quiz.id, title=quiz.title, topic=quiz.topic, questions=questions_out)

@router.post("/{quiz_id}/submit", response_model=QuizSubmitResult)
def submit_quiz(quiz_id: int, submission: QuizSubmitRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found.")
    
    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).all()
    q_map = {q.id: q for q in questions}

    correct_count = 0
    total_questions = len(questions)
    details = []

    for ans in submission.answers:
        q = q_map.get(ans.question_id)
        if q:
            is_correct = (ans.selected_option.strip() == q.correct_answer.strip())
            if is_correct:
                correct_count += 1
            details.append({
                "question_id": q.id,
                "question_text": q.question_text,
                "selected_option": ans.selected_option,
                "correct_answer": q.correct_answer,
                "is_correct": is_correct,
                "explanation": q.explanation
            })

    score_pct = round((correct_count / total_questions) * 100, 1) if total_questions > 0 else 0.0
    passed = score_pct >= 70.0

    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        score=score_pct,
        total_questions=total_questions
    )
    db.add(attempt)
    db.commit()

    return QuizSubmitResult(
        score=score_pct,
        total_questions=total_questions,
        percentage=score_pct,
        passed=passed,
        details=details
    )

@router.get("/history/me", response_model=List[QuizAttemptOut])
def get_user_quiz_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == current_user.id).order_by(QuizAttempt.attempted_at.desc()).all()
    results = []
    for a in attempts:
        quiz = db.query(Quiz).filter(Quiz.id == a.quiz_id).first()
        title = quiz.title if quiz else "AI Quiz"
        results.append(
            QuizAttemptOut(
                id=a.id,
                quiz_id=a.quiz_id,
                quiz_title=title,
                score=a.score,
                total_questions=a.total_questions,
                attempted_at=a.attempted_at
            )
        )
    return results
