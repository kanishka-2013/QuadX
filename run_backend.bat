@echo off
echo Starting DataGenius AI FastAPI Backend on http://127.0.0.1:8000 ...
.\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
pause
