@echo off
rem Compila o Angular e grava o resultado em src\main\resources\static (servido pelo Spring Boot).
setlocal
cd /d "%~dp0frontend"
call npm install
call npm run build
endlocal
