# Step 1: Build React frontend
FROM node:18 AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Step 2: Setup Python backend
FROM python:3.9-slim AS backend
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ ./backend
COPY --from=frontend /app/build ./frontend/build

CMD ["gunicorn", "--chdir", "backend", "app:app", "--bind", "0.0.0.0:8000"]
