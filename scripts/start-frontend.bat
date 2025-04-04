@echo off
echo ===================================
echo    Starting Frontend Application
echo ===================================
echo Application will be available at http://localhost:4200
echo.

cd ..\bslproject - frontend\bsltproject-bank
call npm install
call ng serve --open

echo.
echo Frontend application has stopped.
pause
