@echo off
echo Starting Voxie - API, Dashboard, and App...
echo.

echo [1/3] Starting API on http://localhost:3000 ...
start "Voxie API" cmd /k "cd /d D:\Voxie\api && start.bat"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Dashboard on http://localhost:3001 ...
start "Voxie Dashboard" cmd /k "cd /d D:\Voxie\dashboard && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Starting Flutter App on http://localhost:8080 ...
start "Voxie App" cmd /k "cd /d D:\Voxie\Voxie\app && start.bat"

echo.
echo All services started!
echo   API       -  http://localhost:3000
echo   Dashboard -  http://localhost:3001
echo   App       -  http://localhost:8080
echo.
pause
