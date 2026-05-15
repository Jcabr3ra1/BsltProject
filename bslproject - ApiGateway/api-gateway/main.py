import json
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

try:
    with open("configuracion/config.json", "r") as archivo_config:
        configuracion = json.load(archivo_config)
except Exception as e:
    exit(1)

HOST = configuracion.get("servidor", {}).get("host", "127.0.0.1")
PUERTO = configuracion.get("servidor", {}).get("puerto", 7777)

URL_SEGURIDAD = configuracion.get("servicios", {}).get("seguridad", "http://localhost:8080")
URL_FINANZAS = configuracion.get("servicios", {}).get("finanzas", "http://localhost:9999")

try:
    from rutas.seguridad import router as seguridad_router
    from rutas.finanzas import router as finanzas_router
except Exception as e:
    exit(1)

app = FastAPI(title="API Gateway", description="Puerta de enlace para los microservicios")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def reenviar_token(request: Request, call_next):
    auth_header = request.headers.get("Authorization")

    if auth_header and "{" in auth_header:
        return JSONResponse(status_code=403, content={"error": "El token no es válido. Debe ser una cadena JWT."})

    if auth_header:
        request.headers.__dict__["_list"].append((b"authorization", auth_header.encode()))

    try:
        response = await call_next(request)
        return response
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Error interno del servidor"})

app.include_router(seguridad_router)
app.include_router(finanzas_router)

if __name__ == "__main__":
    try:
        uvicorn.run(app, host=HOST, port=PUERTO)
    except Exception as e:
        pass
