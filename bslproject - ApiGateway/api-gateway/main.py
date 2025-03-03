import json
import uvicorn
from fastapi import FastAPI

# 📌 Mostrar mensaje de inicio de carga
print("⏳ Iniciando carga del API Gateway...")

# 📂 Cargar configuración
try:
    print("📂 Leyendo archivo de configuración...")
    with open("configuracion/config.json", "r") as archivo_config:
        configuracion = json.load(archivo_config)
    print("✅ Configuración cargada correctamente.")
except Exception as e:
    print(f"❌ Error al cargar la configuración: {e}")
    exit(1)

# 📌 Obtener valores del archivo de configuración
HOST = configuracion.get("servidor", {}).get("host", "127.0.0.1")
PUERTO = configuracion.get("servidor", {}).get("puerto", 8000)

print(f"🌍 Configuración del servidor: HOST={HOST}, PUERTO={PUERTO}")

# 📦 Cargar rutas de microservicios
try:
    print("📦 Cargando rutas de seguridad y finanzas...")
    from rutas.seguridad import router as seguridad_router
    from rutas.finanzas import router as finanzas_router
    print("✅ Rutas importadas correctamente.")
except Exception as e:
    print(f"❌ Error al importar rutas: {e}")
    exit(1)

# 🚀 Inicializar FastAPI
print("🚀 Iniciando API Gateway...")
app = FastAPI(title="API Gateway", description="Puerta de enlace para los microservicios")

# 🔗 Incluir las rutas en la API Gateway
print("🔗 Registrando rutas en API Gateway...")
app.include_router(seguridad_router)
app.include_router(finanzas_router)
print("✅ Rutas registradas correctamente.")

# ⚡ Iniciar el servidor con configuración desde `config.json`
if __name__ == "__main__":
    print(f"🚀 API Gateway corriendo en: http://{HOST}:{PUERTO}")
    print("⚡ Iniciando Uvicorn...")
    try:
        uvicorn.run(app, host=HOST, port=PUERTO)
    except Exception as e:
        print(f"❌ Error al iniciar el servidor: {e}")
