@echo off
REM Script de inicio para Windows
REM Uso: start.bat

echo 🚀 Iniciando servidor de Control de Pedidos...
echo.

REM Cambiar al directorio del script
cd /d "%~dp0"

REM Verificar que Node.js esté instalado
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Node.js no está instalado
    echo 📦 Instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar que las dependencias estén instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    call npm install
    echo.
)

REM Iniciar el servidor
echo ✅ Iniciando servidor...
echo.
node server.js

pause
