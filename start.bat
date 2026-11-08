@echo off
cd /d "%~dp0"
where npm >nul 2>nul || (echo Node.js nerastas. Idiek is https://nodejs.org & pause & exit /b 1)
if not exist node_modules call npm install
call npm run dev -- --open
pause
