@echo off
REM 🚀 Footy Oracle v2 - Quick Start Script (Windows)
REM This script sets up and runs both frontend and backend locally

echo 🏆 THE FOOTY ORACLE v2 - Quick Start
echo ====================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Node.js not found. Please install Node.js 18+
    exit /b 1
)
echo ✅ Node.js version:
node -v
echo.

echo 📦 Installing dependencies...
echo.

REM Install root dependencies
echo Installing root dependencies...
call npm install

REM Install frontend dependencies
echo Installing frontend dependencies...
cd apps\frontend
call npm install
cd ..\..

REM Install backend dependencies
echo Installing backend dependencies...
cd apps\backend
call npm install
cd ..\..

echo.
echo ✅ Dependencies installed!
echo.

REM Check for environment files
if not exist "apps\backend\.env" (
    echo ⚠️  Backend .env file not found. Creating from template...
    copy apps\backend\.env.example apps\backend\.env
    echo 📝 Please edit apps\backend\.env with your API keys
)

if not exist "apps\frontend\.env" (
    echo ⚠️  Frontend .env file not found. Creating from template...
    copy apps\frontend\.env.example apps\frontend\.env
)

echo.
echo 🚀 Starting development servers...
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start backend in new window
start "Footy Oracle Backend" cmd /k "cd apps\backend && npm run dev"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
start "Footy Oracle Frontend" cmd /k "cd apps\frontend && npm run dev"

echo.
echo ✅ Both servers started in separate windows
echo.
