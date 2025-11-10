@echo off
echo ====================================
echo   AI VITON Backend Starter
echo ====================================
echo.
echo Activating virtual environment...
call venv_viton\Scripts\activate.bat

echo.
echo Starting FastAPI backend server...
cd backend
python app.py

pause
