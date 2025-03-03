import json
import jwt  # PyJWT para manejar tokens
from jwt import ExpiredSignatureError, InvalidSignatureError, DecodeError
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# 📌 Cargar configuración
with open("configuracion/config.json", "r") as archivo_config:
    configuracion = json.load(archivo_config)

CLAVE_SECRETA = configuracion["seguridad"]["clave_jwt"]

# Middleware de seguridad
seguridad = HTTPBearer()

def verificar_token(credenciales: HTTPAuthorizationCredentials = Security(seguridad)):
    return credenciales.credentials  # ⬅ SOLUCIÓN: Retorna el token original


