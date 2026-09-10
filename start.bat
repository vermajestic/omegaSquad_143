@echo off
title Ocean Sentinel Launcher
echo ========================================================
echo               Starting Ocean Sentinel Platform
echo ========================================================
echo.

:: Get project root directory
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

echo [1/3] Starting FastAPI U-Net Backend on port 8000...
start "Ocean Sentinel - Backend (Port 8000)" cmd /k "cd /d %ROOT_DIR%backend && uvicorn main:app --reload --port 8000"

:: Wait 2 seconds for backend to initialize
timeout /t 2 /nobreak >nul

echo [2/3] Starting Vite Frontend on port 5173...
start "Ocean Sentinel - Frontend (Port 5173)" cmd /k "cd /d %ROOT_DIR% && npm run dev"

:: Wait 3 seconds for Vite to start
timeout /t 3 /nobreak >nul

echo [3/3] Opening browser at http://localhost:5173...
start http://localhost:5173

echo.
echo ========================================================
echo  Both servers are running!
echo  - Frontend: http://localhost:5173
echo  - Backend:  http://localhost:8000/api/v1/status
echo.
echo  Keep the two terminal windows open while testing.
echo ========================================================
