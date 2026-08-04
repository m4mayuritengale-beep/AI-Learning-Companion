from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

try:
    from app.database.session import get_db
    from app.models.domain import User, UserGoal
    from app.schemas.schemas import UserGoalCreate, UserGoalOut, UserOut
    from app.middleware.auth import get_current_user
except ModuleNotFoundError:
    from database.session import get_db
    from models.domain import User, UserGoal
    from schemas.schemas import UserGoalCreate, UserGoalOut, UserOut
    from middleware.auth import get_current_user

router = APIRouter(prefix="/user", tags=["User Profile & Goals"])

@router.get("/goals", response_model=List[UserGoalOut])
def get_user_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goals = db.query(UserGoal).filter(UserGoal.user_id == current_user.id).all()
    return goals

@router.post("/goals", response_model=UserGoalOut, status_code=status.HTTP_201_CREATED)
def create_user_goal(goal_data: UserGoalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_goal = UserGoal(
        user_id=current_user.id,
        title=goal_data.title,
        description=goal_data.description,
        target_date=goal_data.target_date,
        is_completed=False
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal

@router.post("/goals/{goal_id}/toggle", response_model=UserGoalOut)
def toggle_goal(goal_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(UserGoal).filter(UserGoal.id == goal_id, UserGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found.")
    goal.is_completed = not goal.is_completed
    db.commit()
    db.refresh(goal)
    return goal
