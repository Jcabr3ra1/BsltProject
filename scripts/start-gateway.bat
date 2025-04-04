@echo off
echo ===================================
echo    Starting API Gateway
echo ===================================
echo Gateway will be available at http://localhost:7777
echo.

cd ..\bslproject - ApiGateway
call pip install -r requirements.txt
call python main.py

echo.
echo API Gateway has stopped.
pause
