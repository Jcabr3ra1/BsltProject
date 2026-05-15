import json
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import jwt

def load_config():
    try:
        with open("Config/config.json", "r") as f:
            config_data = json.load(f)
        return config_data
    except Exception as e:
        exit(1)

config = load_config()
SECRET_KEY = config.get("jwt-secret", "")

URL_BACKEND = config.get("url-backend", "127.0.0.1")
PORT = config.get("port", 9999)

app = FastAPI(title="BslProject Finance API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

async def verify_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=403, detail="Token no proporcionado")

    token = auth_header.split(" ")[1]
    try:
        jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=403, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=403, detail="Token inválido")

@app.get("/")
def test():
    return {"message": "Finance Service running..."}

try:
    from Controladores.ControladorCuenta import router as cuenta_router
    from Controladores.ControladorBolsillo import router as bolsillo_router
    from Controladores.ControladorTipoMovimiento import router as tipo_movimiento_router
    from Controladores.ControladorTipoTransaccion import router as tipo_transaccion_router
    from Controladores.ControladorTransaccion import router as transaccion_router
    from Controladores.ControladorEstadoTransaccion import router as estado_transaccion_router

    api_prefix = "/finanzas"
    app.include_router(cuenta_router, prefix=f"{api_prefix}/cuentas")
    app.include_router(bolsillo_router, prefix=f"{api_prefix}/bolsillos")
    app.include_router(tipo_movimiento_router, prefix=f"{api_prefix}/tipos-movimiento")
    app.include_router(tipo_transaccion_router, prefix=f"{api_prefix}/tipos-transaccion")
    app.include_router(transaccion_router, prefix=f"{api_prefix}/transacciones")
    app.include_router(estado_transaccion_router, prefix=f"{api_prefix}/estados-transaccion")

except Exception as e:
    exit(1)

if __name__ == "__main__":
    try:
        uvicorn.run(app, host=URL_BACKEND, port=PORT)
    except Exception as e:
        pass
