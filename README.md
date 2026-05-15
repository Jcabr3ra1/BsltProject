# BsltProject — Sistema Bancario

Aplicación bancaria desarrollada con arquitectura de microservicios. Permite gestionar cuentas, transacciones, bolsillos y seguridad de usuarios.

## Arquitectura

```
[Cliente Web (Angular)] ──► [API Gateway :7777]
                                     │
                      ┌──────────────┴──────────────┐
                      │                             │
           [Seguridad :8080]            [Backend Financiero]
           (Spring Boot + JWT)          (FastAPI + MongoDB)
```

## Servicios

| Carpeta | Tecnología | Descripción |
|---|---|---|
| `api-gateway/` | Python · FastAPI | Punto de entrada central, enrutamiento y autenticación |
| `backend-financiero/` | Python · FastAPI | Cuentas, transacciones, bolsillos |
| `seguridad/` | Java · Spring Boot | Autenticación JWT, usuarios y roles |
| `frontend/` | Angular 17 · Material | Interfaz de usuario responsive |

## Requisitos

- Node.js 18+ y npm
- Python 3.10+
- Java 17+ y Maven
- MongoDB
- PostgreSQL

## Levantar el proyecto

Cada servicio tiene su propio `run.bat` (Windows) o `run.sh` (Linux/Mac):

```bash
# API Gateway
cd api-gateway && pip install -r requirements.txt && python main.py

# Backend Financiero
cd backend-financiero && pip install -r requirements.txt && python main.py

# Seguridad
cd seguridad && ./mvnw spring-boot:run

# Frontend
cd frontend && npm install && npm start
```

## Colecciones Postman

En la carpeta `postman/` están las colecciones listas para importar y probar todos los endpoints:

- `BSLTProject-Postman-Finanzas-Bolsillos.json`
- `BSLTProject-Postman-Finanzas-Catalogos.json`
- `BSLTProject-Postman-Finanzas-Cuentas.json`
- `BSLTProject-Postman-Finanzas-Transacciones.json`
- `BSLTProject-Postman-Seguridad.json`

## Documentación

Ver `docs/informe_sistema_bsltproject.txt` para el informe técnico completo del sistema.

## Autor

**Juan David Cabrera Jaller** — [@JCabr3ra1](https://github.com/Jcabr3ra1)
