# STEP 1: Build React app
FROM node:18 AS frontend
WORKDIR /app
COPY frontend/ ./frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# STEP 2: Setup Python backend
FROM python:3.9-slim AS backend
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ ./backend
COPY --from=frontend /app/frontend/build ./frontend/build

CMD ["gunicorn", "--chdir", "backend", "app:app", "--bind", "0.0.0.0:8000"]
