@echo off
echo ===================================
echo    Starting Financial Service
echo ===================================
echo Server will be available at http://localhost:9999
echo.

cd ..\bslproject - backend_financiero
call npm install
call npm start

echo.
echo Financial service has stopped.
pause
