import os
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List

try:
    from app.database.session import get_db
    from app.models.domain import User, Document
    from app.schemas.schemas import DocumentOut
    from app.middleware.auth import get_current_user
    from app.services.pdf_service import pdf_service
    from app.services.ai_service import ai_service
    from app.config import settings
except ModuleNotFoundError:
    from database.session import get_db
    from models.domain import User, Document
    from schemas.schemas import DocumentOut
    from middleware.auth import get_current_user
    from services.pdf_service import pdf_service
    from services.ai_service import ai_service
    from config import settings

logger = logging.getLogger("app")

router = APIRouter(prefix="/upload", tags=["PDF & Documents"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB Limit

@router.post("/pdf", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_pdf(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF documents (.pdf) are permitted.")
    
    content = await file.read()
    
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"File size exceeds maximum permitted threshold of {MAX_FILE_SIZE // (1024*1024)} MB."
        )

    if not content.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid PDF file structure. File content header does not match PDF magic signature."
        )
    
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    safe_filename = "".join(c for c in file.filename if c.isalnum() or c in (".", "_", "-")).strip()
    file_path = os.path.join(settings.UPLOAD_DIR, f"user_{current_user.id}_{safe_filename}")
    
    with open(file_path, "wb") as f:
        f.write(content)

    logger.info("PDF saved to disk for User ID %d: %s (%d bytes)", current_user.id, file_path, len(content))

    try:
        extracted_text = pdf_service.extract_text_from_pdf(file_path)
    except Exception as e:
        logger.error("PyMuPDF extraction failed: %s", str(e))
        extracted_text = f"Could not extract text: {str(e)}"

    summary_text = ai_service.summarize_pdf_text(extracted_text) if extracted_text else "No content to summarize."

    doc = Document(
        user_id=current_user.id,
        filename=file.filename,
        filepath=file_path,
        extracted_text=extracted_text,
        summary=summary_text
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return doc

@router.get("/documents", response_model=List[DocumentOut])
def get_user_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.uploaded_at.desc()).all()
    return docs

@router.get("/documents/{doc_id}", response_model=DocumentOut)
def get_document_detail(doc_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    return doc
