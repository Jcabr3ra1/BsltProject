REM filepath: c:\Users\juan_\Desktop\Proyecto\finanzas-seguridad-api\bslproject - ApiGateway\run.bat
@echo off
echo Starting API Gateway (FastAPI)...
cd %~dp0api-gateway
python main.py
pause