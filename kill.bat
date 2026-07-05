@echo off
echo Stopping CareerDNA AI project (killing port 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    taskkill /PID %%a /F >nul 2>&1
)
echo Done. Server stopped.
pause
