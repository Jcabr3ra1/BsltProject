import json
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import jwt

# Mostrar mensaje de inicio de carga
print("⏳ Iniciando carga del servidor...")

# Cargar configuración desde config.json
def load_config():
    print("📂 Cargando configuración desde config.json...")
    try:
        with open('Config/config.json') as f:
            config_data = json.load(f)
        print("✅ Configuración cargada correctamente.")
        return config_data
    except Exception as e:
        print(f"❌ Error al cargar la configuración: {e}")
        exit(1)

config = load_config()
SECRET_KEY = config.get("jwt-secret", "")

if not SECRET_KEY:
    print("❌ Advertencia: 'jwt-secret' no encontrado en config.json")

# Inicializar FastAPI
print("🚀 Iniciando FastAPI...")
app = FastAPI(title="BslProject API")

# Configuración de CORS
print("🌍 Configurando CORS...")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambiar en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("✅ CORS configurado correctamente.")

# Middleware para verificar JWT (solo si se necesita)
async def verify_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=403, detail="Token no proporcionado")

    token = auth_header.split(" ")[1]  # Extrae solo el token sin "Bearer"
    try:
        jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=403, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=403, detail="Token inválido")

# Endpoint de prueba
@app.get("/")
def test():
    return {"message": "Server running ..."}

# Importar y registrar los controladores
print("📦 Cargando controladores...")

try:
    from Controladores.ControladorCuenta import router as cuenta_router
    from Controladores.ControladorBolsillo import router as bolsillo_router
    from Controladores.ControladorTipoMovimiento import router as tipo_movimiento_router
    from Controladores.ControladorTipoTransaccion import router as tipo_transaccion_router
    from Controladores.ControladorTransaccion import router as transaccion_router

    print("🔗 Registrando rutas en FastAPI...")
    app.include_router(cuenta_router, prefix="/cuentas")
    app.include_router(bolsillo_router, prefix="/bolsillos")
    app.include_router(tipo_movimiento_router, prefix="/tipo_movimiento")
    app.include_router(tipo_transaccion_router, prefix="/tipo_transaccion")
    app.include_router(transaccion_router, prefix="/transacciones")
    print("✅ Rutas registradas correctamente.")

except Exception as e:
    print(f"❌ Error al cargar controladores: {e}")
    exit(1)

# Iniciar el servidor con Uvicorn
if __name__ == "__main__":
    print(f"🚀 Servidor corriendo en: http://{config['url-backend']}:{config['port']}")
    print("⚡ Iniciando Uvicorn...")
    try:
        uvicorn.run(app, host=config["url-backend"], port=config["port"])
    except Exception as e:
        print(f"❌ Error al iniciar el servidor: {e}")
