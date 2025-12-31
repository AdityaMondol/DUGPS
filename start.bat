@echo off
echo ========================================
echo  Darul Ulum School System Launcher
echo ========================================
echo.

echo [1/3] Initializing Native File Database...
echo Database will be automatically created in backend/database/
echo.

echo [2/3] Starting Backend Server...
start "Darul Ulum - Backend" cmd /k "cd /d a:\DUGPS\backend && echo Starting backend server with enhanced logging... && npm start"

echo Waiting for backend to initialize...
timeout /t 8 >nul

echo.
echo [3/3] Starting Frontend Server...
start "Darul Ulum - Frontend" cmd /k "cd /d a:\DUGPS\frontend && echo Starting frontend development server... && npm run dev"

echo Waiting for frontend to initialize...
timeout /t 10 >nul

echo.
echo Opening application in browser...
start http://localhost:3000

echo.
echo ========================================
echo  System launched successfully!
echo ========================================
echo.
echo Backend:     http://localhost:5000
echo Frontend:    http://localhost:3000
echo Database:    Native File System (backend/database/)
echo.
echo Press any key to exit this window...
pause >nul