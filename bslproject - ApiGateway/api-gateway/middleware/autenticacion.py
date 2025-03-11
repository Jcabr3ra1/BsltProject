import json
import jwt  # PyJWT para manejar tokens
from jwt import ExpiredSignatureError, InvalidSignatureError, DecodeError
from fastapi import Request, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict, Any

# Cargar configuración
with open("configuracion/config.json", "r") as archivo_config:
    configuracion = json.load(archivo_config)

CLAVE_SECRETA = configuracion["seguridad"]["clave_jwt"]
print("Clave secreta cargada correctamente")

seguridad = HTTPBearer()

async def verificar_token(credenciales: HTTPAuthorizationCredentials = Security(seguridad)) -> Dict[str, Any]:
    """Verifica la validez del token y devuelve un diccionario con el token y su contenido decodificado."""
    token = credenciales.credentials
    print(f"Token recibido en API Gateway: {token}")

    try:
        contenido = jwt.decode(token, CLAVE_SECRETA, algorithms=["HS256"])
        print(f"Token válido: {contenido}")
        return {"token": token, "contenido": contenido}
    except ExpiredSignatureError:
        raise HTTPException(status_code=403, detail="Token expirado")
    except (InvalidSignatureError, DecodeError):
        raise HTTPException(status_code=403, detail="Token inválido")

def verificar_rol(rol_requerido: str):
    """Dependencia de FastAPI para verificar si el usuario tiene un rol específico"""
    async def rol_dependencia(token_info: Dict[str, Any] = Depends(verificar_token)) -> Dict[str, Any]:
        contenido = token_info["contenido"]
        roles = [r.upper() for r in contenido.get("roles", [])]
        print(f"Roles extraídos del token: {roles}")

        if rol_requerido.upper() not in roles:
            print(f"Acceso denegado: se requiere rol {rol_requerido}")
            raise HTTPException(status_code=403, detail=f"Acceso denegado: se requiere rol {rol_requerido}")

        return contenido

    return rol_dependencia

def verificar_roles_permitidos(roles_permitidos: List[str]):
    """Middleware para verificar si el usuario tiene alguno de los roles permitidos."""
    async def wrapper(request: Request, token_info: Dict[str, Any] = Depends(verificar_token)) -> Dict[str, Any]:
        contenido = token_info["contenido"]
        roles_usuario = [r.upper() for r in contenido.get("roles", [])]

        print(f"Verificando roles permitidos: {roles_permitidos}. Roles usuario: {roles_usuario}")

        # Si el usuario es ADMIN, conceder acceso sin importar los permisos requeridos
        if "ADMIN" in roles_usuario:
            print("Acceso concedido: el usuario es ADMIN")
            return contenido

        # Si tiene uno de los roles permitidos, conceder acceso
        roles_permitidos_upper = [r.upper() for r in roles_permitidos]
        if any(r in roles_usuario for r in roles_permitidos_upper):
            print("Acceso concedido: el usuario tiene el rol requerido")
            return contenido

        # Si no cumple con ninguno, denegar acceso
        raise HTTPException(status_code=403,
                          detail=f"Acceso denegado: se requiere uno de los roles {roles_permitidos_upper}")

    return wrapper
