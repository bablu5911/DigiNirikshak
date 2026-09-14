@echo off
title DigiNirikshak Persistent Server (30m+ Live Session)
echo ================================================================
echo   DigiNirikshak - Persistent Server & Stable Cloudflare Tunnel
echo   Department of Consumer Affairs (DoCA) | SIH26034
echo ================================================================
echo.
cd /d "%~dp0"
echo [1/2] Launching Fast Production Preview on http://127.0.0.1:5173...
start /b cmd /c "npm run preview -- --host 127.0.0.1 --port 5173"
timeout /t 3 /nobreak >nul
echo.
echo [2/2] Launching Cloudflare Tunnel with HTTP/2 (Zero Timeout Protocol)...
echo Note: Keep this window OPEN as long as you need the public tunnel to stay active!
echo.
.\cloudflared.exe tunnel --protocol http2 --edge-ip-version 4 --url http://127.0.0.1:5173
pause
