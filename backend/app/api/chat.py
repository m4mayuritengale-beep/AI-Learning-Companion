from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

try:
    from app.database.session import get_db
    from app.models.domain import User, ChatSession, ChatMessage
    from app.schemas.schemas import ChatMessageCreate, ChatMessageOut, ChatSessionOut, ConceptExplainRequest
    from app.middleware.auth import get_current_user
    from app.services.ai_service import ai_service
except ModuleNotFoundError:
    from database.session import get_db
    from models.domain import User, ChatSession, ChatMessage
    from schemas.schemas import ChatMessageCreate, ChatMessageOut, ChatSessionOut, ConceptExplainRequest
    from middleware.auth import get_current_user
    from services.ai_service import ai_service

router = APIRouter(prefix="/chat", tags=["AI Chat Tutor"])

@router.get("/sessions", response_model=List[ChatSessionOut])
def get_chat_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc()).all()
    return sessions

@router.post("/sessions", response_model=ChatSessionOut)
def create_chat_session(title: str = "New Study Session", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = ChatSession(user_id=current_user.id, title=title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.post("/message", response_model=ChatMessageOut)
def send_chat_message(data: ChatMessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session_id = data.session_id
    if not session_id:
        session = ChatSession(user_id=current_user.id, title=data.message[:30] + "...")
        db.add(session)
        db.commit()
        db.refresh(session)
        session_id = session.id
    else:
        session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found.")

    user_msg = ChatMessage(session_id=session_id, sender="user", message=data.message)
    db.add(user_msg)
    db.commit()

    history_msgs = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()
    history = [{"sender": m.sender, "message": m.message} for m in history_msgs]

    ai_reply_text = ai_service.generate_tutor_response(data.message, chat_history=history)

    ai_msg = ChatMessage(session_id=session_id, sender="ai", message=ai_reply_text)
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    return ai_msg

@router.post("/explain-concept")
def explain_concept(req: ConceptExplainRequest, current_user: User = Depends(get_current_user)):
    explanation = ai_service.explain_concept(req.concept, depth=req.depth)
    return {"concept": req.concept, "depth": req.depth, "explanation": explanation}
