@echo off
echo Starting Soccer Team Maker...
echo.

REM Change to the project directory
cd /d "C:\Users\guysa\Documents\Soccer-app\soccer-team-maker"

REM Start the development server in the background
echo Starting development server...
start /min cmd /c "npm start"

REM Wait a few seconds for the server to start
echo Waiting for server to initialize...
timeout /t 8 /nobreak >nul

REM Open Chrome to the local development server
echo Opening Soccer Team Maker in Chrome...
start chrome "http://localhost:3000"

echo.
echo Soccer Team Maker is starting up!
echo The server is running in a minimized window.
echo Close that window when you're done to stop the server.
echo.
pause