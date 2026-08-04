# Multi-stage Dockerfile for FastAPI Application Shell
FROM python:3.13-slim as base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on

WORKDIR /app

# Install system dependencies for PyMuPDF & SQLite
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY backend/app/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY backend/app /app/backend/app
COPY database /app/database

WORKDIR /app/backend/app

EXPOSE 8000

CMD ["python", "main.py"]
