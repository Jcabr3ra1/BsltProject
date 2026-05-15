import json
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

# Mostrar mensaje de inicio de carga
print("Iniciando carga del API Gateway...")

# Cargar configuración
try:
    print("Leyendo archivo de configuración...")
    with open("configuracion/config.json", "r") as archivo_config:
        configuracion = json.load(archivo_config)
    print("Configuración cargada correctamente.")
except Exception as e:
    print(f"Error al cargar la configuración: {e}")
    exit(1)

# Obtener valores del archivo de configuración
HOST = configuracion.get("servidor", {}).get("host", "127.0.0.1")
PUERTO = configuracion.get("servidor", {}).get("puerto", 7777)

URL_SEGURIDAD = configuracion.get("servicios", {}).get("seguridad", "http://localhost:8080")
URL_FINANZAS = configuracion.get("servicios", {}).get("finanzas", "http://localhost:9999")

print(f"Configuración del API Gateway: HOST={HOST}, PUERTO={PUERTO}")
print(f"Servicio de Seguridad en: {URL_SEGURIDAD}")
print(f"Servicio de Finanzas en: {URL_FINANZAS}")

# Cargar rutas de microservicios
try:
    print("Cargando rutas de seguridad y finanzas...")
    from rutas.seguridad import router as seguridad_router
    from rutas.finanzas import router as finanzas_router
    print("Rutas importadas correctamente.")
except Exception as e:
    print(f"Error al importar rutas: {e}")
    exit(1)

# Inicializar FastAPI
print("Iniciando API Gateway...")
app = FastAPI(title="API Gateway", description="Puerta de enlace para los microservicios")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware para capturar y reenviar Authorization
@app.middleware("http")
async def reenviar_token(request: Request, call_next):
    """Middleware para asegurarse de que el token JWT se reenvíe correctamente."""
    auth_header = request.headers.get("Authorization")

    if auth_header and "{" in auth_header:
        print("ERROR: Se detectó un token alterado. Debe ser una cadena JWT.")
        return JSONResponse(status_code=403, content={"error": "El token no es válido. Debe ser una cadena JWT."})

    if auth_header:
        print(f"Middleware - Reenviando token de autorización: {auth_header[:30]}...")
        # Asegurarse de que el token se reenvía correctamente
        request.headers.__dict__["_list"].append((b"authorization", auth_header.encode()))
        
        # Imprimir todas las cabeceras para depuración
        print("Middleware - Todas las cabeceras:")
        for header, value in request.headers.items():
            print(f"  {header}: {value[:30]}...")

    try:
        response = await call_next(request)
        return response
    except Exception as e:
        print(f"Error en Middleware: {e}")
        return JSONResponse(status_code=500, content={"error": "Error interno del servidor"})

# Incluir las rutas en la API Gateway
print("Registrando rutas en API Gateway...")
app.include_router(seguridad_router)
app.include_router(finanzas_router)
print("Rutas registradas correctamente.")

# Iniciar el servidor con configuración desde config.json
if __name__ == "__main__":
    print(f"API Gateway corriendo en: http://{HOST}:{PUERTO}")
    print("Iniciando Uvicorn...")
    try:
        uvicorn.run(app, host=HOST, port=PUERTO)
    except Exception as e:
        print(f"Error al iniciar el servidor: {e}")
