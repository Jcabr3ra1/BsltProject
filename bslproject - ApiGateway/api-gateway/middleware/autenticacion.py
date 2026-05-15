import json
import jwt
from jwt import ExpiredSignatureError, InvalidSignatureError, DecodeError
from fastapi import Request, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict, Any

with open("configuracion/config.json", "r") as archivo_config:
    configuracion = json.load(archivo_config)

CLAVE_SECRETA = configuracion["seguridad"]["clave_jwt"]

seguridad = HTTPBearer()

async def verificar_token(credenciales: HTTPAuthorizationCredentials = Security(seguridad)) -> Dict[str, Any]:
    token = credenciales.credentials

    try:
        contenido = jwt.decode(token, CLAVE_SECRETA, algorithms=["HS256"])

        if "roles" not in contenido or not contenido["roles"]:
            contenido["roles"] = ["USER"]

        return {"token": token, "contenido": contenido}
    except ExpiredSignatureError:
        raise HTTPException(status_code=403, detail="Token expirado")
    except (InvalidSignatureError, DecodeError):
        raise HTTPException(status_code=403, detail="Token inválido")

def verificar_rol(rol_requerido: str):
    async def rol_dependencia(token_info: Dict[str, Any] = Depends(verificar_token)) -> Dict[str, Any]:
        contenido = token_info["contenido"]
        roles = [r.upper() for r in contenido.get("roles", [])]

        if rol_requerido.upper() not in roles:
            user_id = contenido.get("sub")
            if user_id and len(user_id) == 32 and all(c in "0123456789abcdef" for c in user_id.lower()):
                return contenido

            raise HTTPException(status_code=403, detail=f"Acceso denegado: se requiere rol {rol_requerido}")

        return contenido

    return rol_dependencia

def verificar_roles_permitidos(roles_permitidos: List[str]):
    async def wrapper(request: Request, token_info: Dict[str, Any] = Depends(verificar_token)) -> Dict[str, Any]:
        contenido = token_info["contenido"]
        roles_usuario = [r.upper() for r in contenido.get("roles", [])]

        if "ADMIN" in roles_usuario:
            return contenido

        roles_permitidos_upper = [r.upper() for r in roles_permitidos]
        if any(r in roles_usuario for r in roles_permitidos_upper):
            return contenido

        user_id = ""
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            try:
                token = auth_header.replace("Bearer ", "")
                decoded = jwt.decode(token, CLAVE_SECRETA, algorithms=["HS256"])
                email = decoded.get("sub", "")

                if email:
                    if "USER" in roles_permitidos_upper:
                        return contenido
            except Exception as e:
                pass

        raise HTTPException(status_code=403,
                          detail=f"Acceso denegado: se requiere uno de los roles {roles_permitidos_upper}")

    return wrapper
