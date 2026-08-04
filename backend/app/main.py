import os
import sys
import logging

# Ensure both backend parent directory and app directory are in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))  # .../backend/app
backend_dir = os.path.dirname(current_dir)                 # .../backend

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

try:
    from app.config import settings
    from app.utils.logging_config import setup_logging
    from app.database.init_db import init_db
    from app.api import auth, user, course, chat, upload, quiz, progress, lesson
except ModuleNotFoundError:
    from config import settings
    from utils.logging_config import setup_logging
    from database.init_db import init_db
    from api import auth, user, course, chat, upload, quiz, progress, lesson

# Setup logging configuration
setup_logging()
logger = logging.getLogger("app")

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Custom Middleware for Security HTTP Headers & Request Logging
class SecurityAndLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        logger.info("Incoming Request: %s %s", request.method, request.url.path)
        response = await call_next(request)
        
        # Set Security Headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        logger.info("Response Status: %s %s -> %d", request.method, request.url.path, response.status_code)
        return response

app.add_middleware(SecurityAndLoggingMiddleware)

# Configure CORS Middleware
app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Unhandled Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled Exception on %s %s: %s", request.method, request.url.path, str(exc), exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred. Please try again later.",
            "error_code": "INTERNAL_SERVER_ERROR",
        },
    )

# Startup Database Seeder
@app.on_event("startup")
def on_startup():
    init_db()
    logger.info("Database initialized successfully on application startup.")

# Health Check Endpoint
@app.get("/")
def root():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "docs": "/docs",
        "api_v1_prefix": settings.API_V1_STR
    }

# Register Routers under /api/v1
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(user.router, prefix=settings.API_V1_STR)
app.include_router(course.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(upload.router, prefix=settings.API_V1_STR)
app.include_router(quiz.router, prefix=settings.API_V1_STR)
app.include_router(progress.router, prefix=settings.API_V1_STR)
app.include_router(lesson.router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
