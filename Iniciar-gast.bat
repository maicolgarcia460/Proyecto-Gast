@echo off

echo ==========================================
echo       INICIANDO ENTORNO GAST
echo ==========================================

echo.
echo Iniciando servidor Node.js...
start "GAST - Node.js" cmd /k "cd /d E:\Proyecto GAST\Backend && node server.js"

timeout /t 3 /nobreak >nul

echo Iniciando servidor Apache...
start "GAST - Apache" cmd /k "cd /d C:\Apache24\bin && httpd.exe"

echo.
echo ==========================================
echo      ENTORNO GAST INICIADO
echo ==========================================
echo.
echo Acceso: http://localhost/
echo.
pause