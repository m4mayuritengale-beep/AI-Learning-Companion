from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

try:
    from app.database.session import get_db
    from app.models.domain import User
    from app.schemas.schemas import UserRegister, UserLogin, UserOut, Token
    from app.utils.security import (
        verify_password, 
        get_password_hash, 
        create_access_token, 
        create_refresh_token,
        decode_refresh_token,
        validate_password_strength
    )
    from app.middleware.auth import get_current_user
except ModuleNotFoundError:
    from database.session import get_db
    from models.domain import User
    from schemas.schemas import UserRegister, UserLogin, UserOut, Token
    from utils.security import (
        verify_password, 
        get_password_hash, 
        create_access_token, 
        create_refresh_token,
        decode_refresh_token,
        validate_password_strength
    )
    from middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    validate_password_strength(user_data.password)

    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered."
        )
    
    hashed_pwd = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pwd,
        full_name=user_data.full_name,
        role="student"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(subject=new_user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(new_user)
    )

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )
    
    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@router.post("/refresh")
def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_refresh_token(req.refresh_token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token.")
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists.")

    new_access_token = create_access_token(subject=user.id)
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
