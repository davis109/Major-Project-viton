@echo off
echo Starting AI VITON Next.js Frontend...
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting development server on port 3001...
echo Open http://localhost:3001 in your browser
echo.

npm run dev