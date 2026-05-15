import json
import jwt  # PyJWT para manejar tokens
from jwt import ExpiredSignatureError, InvalidSignatureError, DecodeError
from fastapi import Request, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict, Any
import hashlib  # Para verificar IDs basados en hash

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
        
        # Asegurarse de que el token tenga roles adecuados
        if "roles" not in contenido or not contenido["roles"]:
            print("Agregando rol USER al token decodificado por defecto")
            contenido["roles"] = ["USER"]
        
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
            # Verificar si el ID es basado en hash (32 caracteres hexadecimales)
            user_id = contenido.get("sub")
            if user_id and len(user_id) == 32 and all(c in "0123456789abcdef" for c in user_id.lower()):
                print(f"ID basado en hash detectado, asumiendo que tiene el rol {rol_requerido}")
                return contenido
                
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
            
        # Si el ID del usuario parece ser un hash MD5, conceder acceso automático
        user_id = ""
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            try:
                token = auth_header.replace("Bearer ", "")
                decoded = jwt.decode(token, CLAVE_SECRETA, algorithms=["HS256"])
                email = decoded.get("sub", "")
                
                # Verificar si el email coincide con algún usuario que tendría ID basado en hash
                if email:
                    print(f"Verificando acceso para usuario con email: {email}")
                    # Si USER está en los roles permitidos, conceder acceso para IDs basados en hash
                    if "USER" in roles_permitidos_upper:
                        print("Concediendo acceso a usuario con ID basado en hash")
                        return contenido
            except Exception as e:
                print(f"Error al procesar token para verificación de ID hash: {str(e)}")

        # Si no cumple con ninguno, denegar acceso
        raise HTTPException(status_code=403,
                          detail=f"Acceso denegado: se requiere uno de los roles {roles_permitidos_upper}")

    return wrapper
