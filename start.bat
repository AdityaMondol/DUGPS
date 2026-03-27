@echo off
setlocal enabledelayedexpansion

echo ========================================
echo  Darul Ulum School System Launcher
echo ========================================
echo  Status: Serverless Integration Active
echo.

set "ROOT_DIR=%~dp0"
cd /d "!ROOT_DIR!"

echo [1/1] Starting Frontend Development Server...
start "Darul Ulum - Frontend" cmd /k "cd /d !ROOT_DIR!frontend && echo Starting frontend dev server... && npm run dev"

echo Waiting for frontend to initialize...
timeout /t 5 >nul

echo.
echo Opening application in browser...
start http://localhost:3000

echo.
echo ========================================
echo  System launched successfully!
echo ========================================
echo.
echo View at: http://localhost:3000
echo Backend: Supabase (Serverless)
echo.
echo Press any key to exit this window...
pause >nul