# API Documentation: AI Personalized Learning Companion

Base URL: `http://localhost:8000/api/v1`

---

## Authentication (`/auth`)

### 1. User Registration
`POST /auth/register`
- **Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "full_name": "Mayuri Student"
}
```
- **Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "student@example.com",
    "full_name": "Mayuri Student",
    "role": "student",
    "created_at": "2026-07-25T11:00:00Z"
  }
}
```

### 2. User Login
`POST /auth/login`
- **Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

---

## AI Tutor Companion (`/chat`)

### 1. Send Message to AI Tutor
`POST /chat/message` (Requires Bearer Token)
- **Request Body:**
```json
{
  "session_id": 1,
  "message": "Explain how gradient descent optimizes neural network weights."
}
```

### 2. Simplify Concept
`POST /chat/explain-concept`
- **Request Body:**
```json
{
  "concept": "Backpropagation",
  "depth": "beginner"
}
```

---

## PDF Upload & Summarizer (`/upload`)

### 1. Upload PDF
`POST /upload/pdf` (Multipart Form Data)
- **File:** PDF file binary
- **Response:**
```json
{
  "id": 1,
  "filename": "Lecture_Notes_AI.pdf",
  "summary": "Key Takeaways:\n1. Neural networks map inputs to outputs...",
  "uploaded_at": "2026-07-25T11:05:00Z"
}
```

---

## AI Quiz Engine (`/quizzes`)

### 1. Generate Quiz
`POST /quizzes/generate?topic=Deep%20Learning`

### 2. Submit Quiz for Automated Scoring
`POST /quizzes/{id}/submit`
- **Request Body:**
```json
{
  "answers": [
    { "question_id": 1, "selected_option": "Gradient Descent" }
  ]
}
```

---

## Analytics (`/analytics`)

### 1. Dashboard Stats
`GET /analytics/stats`

### 2. Recharts Progress Data
`GET /analytics/progress-chart`
