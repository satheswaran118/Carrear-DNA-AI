@echo off
echo ========================================
echo   CareerDNA AI - Starting...
echo ========================================
cd /d "%~dp0"
echo [1/2] Installing dependencies...
npm install
echo.
echo [2/2] Starting dev server...
echo Open http://localhost:5173 in your browser
echo.
npm run dev
pause
