@echo off
cd /d "c:\Users\sebas\Downloads\AI_VITON-main\AI_VITON-main\back\backend"
C:\Users\sebas\AppData\Local\Programs\Python\Python310\python.exe -m uvicorn app:app --host 0.0.0.0 --port 8000
pause
