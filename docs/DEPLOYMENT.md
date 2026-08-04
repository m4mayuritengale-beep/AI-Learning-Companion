# Enterprise Deployment & Operations Guide

## Overview

This guide provides instructions for deploying the **AI Personalized Learning Companion** to production environments (AWS, GCP, DigitalOcean, or Docker/Kubernetes clusters).

---

## Production Architecture Setup

```
[ Nginx Reverse Proxy / Cloudflare SSL ]
             │
             ├──> [ Frontend Static Assets (Port 5173 / CDN) ]
             │
             └──> [ FastAPI Backend Gunicorn/Uvicorn (Port 8000) ]
                        │
                        ├──> [ PostgreSQL DB ]
                        └──> [ Google Gemini API ]
```

---

## 1. Prerequisites

- Server with Docker Engine v24+ & Docker Compose v2+
- Domain name pointed to server IP with SSL certificates (Let's Encrypt / Certbot)
- Google Gemini API Key

---

## 2. Docker Production Deployment

### Step A: Clone & Environment Config
```bash
git clone https://github.com/your-org/personalized-ai-learning-companion.git
cd personalized-ai-learning-companion

cp backend/app/.env.example backend/app/.env
```

Edit `backend/app/.env`:
```env
SECRET_KEY=your-production-high-entropy-64-character-jwt-key
DATABASE_URL=postgresql://user:pass@db:5432/learning_companion
GEMINI_API_KEY=AIzaSy...
```

### Step B: Build and Run Container Suite
```bash
docker-compose up -d --build
```

---

## 3. Database Migration Execution (Alembic)

To apply database schema migrations in production:
```bash
docker exec -it ai_learning_companion_backend alembic upgrade head
```

---

## 4. Monitoring & Logging

Production logs are written to rotating files at `logs/app.log`:
```bash
# Tail production application logs
tail -f logs/app.log
```

---

## 5. Security Checklist

- [x] CORS restricted to official domain origin.
- [x] Passwords hashed with Bcrypt (min 8 characters, uppercase, digit requirement).
- [x] Security HTTP Headers enabled (`X-Frame-Options`, `X-Content-Type-Options`, `HSTS`).
- [x] Uploaded PDF file size capped at 10MB with magic byte signature verification.
- [x] JWT Bearer token authentication with refresh token support.
