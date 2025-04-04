@echo off
echo ===================================
echo    Starting Security Service
echo ===================================
echo Server will be available at http://localhost:8080
echo.

cd ..\bslproject - seguridad\BsltProject
call mvnw spring-boot:run

echo.
echo Security service has stopped.
pause
