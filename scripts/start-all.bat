@echo off
echo ===================================
echo    Starting All Services
echo ===================================
echo.

echo Starting Security Service...
start cmd /k call start-seguridad.bat

echo Starting Financial Service...
start cmd /k call start-finanzas.bat

echo Starting API Gateway...
start cmd /k call start-gateway.bat

echo Starting Frontend Application...
start cmd /k call start-frontend.bat

echo.
echo All services are starting in separate windows.
echo.
pause
