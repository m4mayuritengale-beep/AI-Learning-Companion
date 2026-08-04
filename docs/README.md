# 🤖 AI Personalized Learning Companion

A production-ready, full-stack **AI Personalized Learning Companion** built with **React 19 (Vite) + Bootstrap 5 + Recharts** on the frontend and **Python 3.13 + FastAPI + SQLAlchemy ORM + Google Gemini API (`google-genai`)** on the backend.

---

## 🌟 Key Features

1. **🔐 User Authentication & JWT Security:** Registration, login, password hashing (bcrypt), token verification, protected routes.
2. **🤖 Socratic AI Companion & Tutor:** Real-time conversational AI tutor powered by Google Gemini API with chat session memory.
3. **📄 PDF Study Notes Summarizer (RAG Ready):** Upload PDF lecture notes, extract text via PyMuPDF (`fitz`), and generate structured study guides.
4. **📝 Dynamic AI Quiz Generator:** Generate multiple-choice quizzes on any topic with instant automated grading, detailed explanations, and attempt history.
5. **🗺️ Personalized AI Learning Path Generator:** Custom step-by-step career & subject roadmaps tailored to student goals and skill levels.
6. **📊 Recharts Analytics Dashboard:** Visual progress tracking (study hours vs. quiz accuracy trends), active streak tracker, and AI recommendations.
7. **📚 Course Catalog & Lesson Reader:** Interactive modules, lesson completion tracking, and progress metrics.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Styling:** Bootstrap 5 + Custom Modern CSS (Responsive Grid)
- **Routing:** React Router v7
- **HTTP Client:** Axios with JWT bearer token interceptors
- **Data Visualization:** Recharts AreaChart & BarChart
- **Icons:** React Icons (`fi`)

### Backend
- **Framework:** Python 3.13+ / FastAPI
- **Validation:** Pydantic v2
- **ORM & Database:** SQLAlchemy 2.0 / SQLite (Dev) / PostgreSQL (Prod)
- **Security:** Passlib (bcrypt), PyJWT / python-jose
- **AI Integration:** Google Gemini API (`google-genai`), PyMuPDF (`fitz`)
- **Server:** Uvicorn

---

## 🚀 Quickstart & Setup Guide

### 1. Backend Setup
```bash
cd backend/app
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `backend/app/.env`:
```env
SECRET_KEY=super-secret-jwt-key-for-ai-companion-2026
DATABASE_URL=sqlite:///./learning_companion.db
GEMINI_API_KEY=your_google_gemini_api_key_here
```

Launch the FastAPI Backend Server:
```bash
python main.py
# Server will run at http://localhost:8000
# OpenAPI Docs available at http://localhost:8000/docs
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App will run at http://localhost:5173
```

---

## 👤 Default Demo Credentials

- **Email:** `student@example.com`
- **Password:** `password123`
