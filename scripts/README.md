# BSLT Bank - Startup Scripts

This directory contains scripts to easily start different components of the BSLT Bank application.

## Available Scripts

- `start-all.bat`: Starts all services in separate windows (recommended)
- `start-seguridad.bat`: Starts only the Security Service (Spring Boot) on port 8080
- `start-finanzas.bat`: Starts only the Financial Service on port 9999
- `start-gateway.bat`: Starts only the API Gateway on port 7777
- `start-frontend.bat`: Starts only the Angular Frontend on port 4200

## Usage

1. Double-click on the script you want to run
2. Wait for the service to start
3. Use Ctrl+C to stop the service when you're done

## Command Line Usage

If you prefer to run the services directly from the command line:

### Command Prompt (CMD)
```cmd
REM Security Service (Spring Boot)
cd "C:\Users\juan_\Desktop\Proyecto\finanzas-seguridad-api\bslproject - seguridad\BsltProject"
mvnw.cmd spring-boot:run

REM Financial Service
cd "C:\Users\juan_\Desktop\Proyecto\finanzas-seguridad-api\bslproject - backend_financiero"
npm install
npm start

REM API Gateway
cd "C:\Users\juan_\Desktop\Proyecto\finanzas-seguridad-api\bslproject - ApiGateway"
pip install -r requirements.txt
python main.py

REM Angular Frontend
cd "C:\Users\juan_\Desktop\Proyecto\finanzas-seguridad-api\bslproject - frontend\bsltproject-bank"
npm install
ng serve --open
```

### PowerShell
```powershell
# Security Service (Spring Boot)
Set-Location -Path "C:\Users\juan_\Desktop\Proyecto\finanzas-seguridad-api\bslproject - seguridad\BsltProject"
.\mvnw.cmd spring-boot:run

# Financial Service
Set-Location -Path "C:\Users\juan_\Desktop\Proyecto\finanzas-seguridad-api\bslproject - backend_financiero"
npm install
npm start

# API Gateway
Set-Location -Path "C:\Users\juan_\Desktop\Proyecto\finanzas-seguridad-api\bslproject - ApiGateway"
pip install -r requirements.txt
python main.py

# Angular Frontend
Set-Location -Path "C:\Users\juan_\Desktop\Proyecto\finanzas-seguridad-api\bslproject - frontend\bsltproject-bank"
npm install
ng serve --open
```

## Service URLs

- Security Service: http://localhost:8080
- Financial Service: http://localhost:9999
- API Gateway: http://localhost:7777
- Frontend: http://localhost:4200

## Prerequisites

- Java 11 or higher must be installed for Security Service
- Node.js and npm must be installed for Financial Service and Frontend
- Python 3.x must be installed for API Gateway
