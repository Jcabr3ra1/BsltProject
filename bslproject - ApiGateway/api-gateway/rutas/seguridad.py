import jwt
import requests
from fastapi import APIRouter, Request, HTTPException, Depends
from starlette.responses import JSONResponse
from middleware.autenticacion import verificar_token, verificar_rol, verificar_roles_permitidos, CLAVE_SECRETA
import json


# Cargar configuración
with open("configuracion/config.json", "r") as archivo_config:
    configuracion = json.load(archivo_config)

URL_SEGURIDAD = configuracion["servicios"]["seguridad"]
URL_FINANZAS = configuracion["servicios"]["finanzas"]

router = APIRouter(prefix="/seguridad")

# AUTENTICACIÓN
@router.post("/autenticacion/login")
async def login(request: Request):
    """Autenticar usuario"""
    try:
        datos = await request.json()
        print(f"Intento de login recibido para: {datos.get('email')}")

        # Validar datos requeridos
        if not datos.get('email') or not datos.get('password'):
            raise HTTPException(status_code=400, detail="Email y contraseña son requeridos")

        # Intentar autenticar con el servicio de seguridad
        response = requests.post(
            f"{URL_SEGURIDAD}/seguridad/autenticacion/login", 
            json=datos,
            headers={"Content-Type": "application/json"}
        )

        print(f"Respuesta del servicio de seguridad: {response.status_code}")

        # Simplemente devolver la respuesta tal como viene del servicio de seguridad
        return JSONResponse(
            status_code=response.status_code,
            content=response.json() if response.text else {}
        )
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Formato de datos inválido")
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="No se pudo conectar con el servicio de autenticación"
        )
    except Exception as e:
        print(f"Error inesperado en login: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/autenticacion/registro")
async def registrar_usuario(request: Request):
    """Registrar un nuevo usuario (abierto para todos)"""
    datos = await request.json()
    response = requests.post(f"{URL_SEGURIDAD}/seguridad/autenticacion/registro", json=datos)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al registrar usuario")

@router.post("/autenticacion/verificar-token")
async def verificar_token(request: Request):
    """Verifica la validez de un token JWT"""
    try:
        datos = await request.json()
        token = datos.get('token')

        if not token:
            return JSONResponse(
                status_code=400,
                content={"isValid": False, "error": "Token no proporcionado"}
            )

        # Verificar el token directamente con middleware
        try:
            # Decodificar el token
            contenido = jwt.decode(token, CLAVE_SECRETA, algorithms=["HS256"])
            
            # Obtener información del token
            email = contenido.get('sub')
            roles = contenido.get('roles', [])
            
            # Asegurarse de que al menos tenga el rol USER si no tiene ningún rol
            if not roles:
                roles = ["USER"]
            elif "USER" not in roles and "ADMIN" not in roles and "MODERATOR" not in roles:
                roles.append("USER")
            
            # Si llegamos aquí, el token es válido
            # Obtener usuario desde el servicio de seguridad
            usuario_response = requests.get(
                f"{URL_SEGURIDAD}/seguridad/usuarios/email/{email}",
                headers={"Authorization": f"Bearer {token}"}
            )

            if usuario_response.status_code == 200:
                return JSONResponse(
                    status_code=200,
                    content={"isValid": True, "user": usuario_response.json()}
                )
            else:
                # Extraer ID único del token (usando el hash del token como ID provisional)
                # Esto es mejor que un "temp-id" fijo
                import hashlib
                token_id = hashlib.md5(f"{email}:{roles}".encode()).hexdigest()
                
                # Log para debug
                print(f"No se pudo obtener usuario de seguridad. Generando ID basado en token: {token_id}")
                print(f"Roles asignados al usuario: {roles}")
                
                return JSONResponse(
                    status_code=200,
                    content={"isValid": True, "user": {
                        "id": token_id,
                        "email": email,
                        "roles": roles
                    }}
                )

        except (jwt.ExpiredSignatureError, jwt.InvalidSignatureError, jwt.DecodeError):
            return JSONResponse(
                status_code=200,
                content={"isValid": False, "error": "Token inválido o expirado"}
            )

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Formato de datos inválido")
    except Exception as e:
        print(f"Error inesperado en verificar_token: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cerrar-sesion")
async def cerrar_sesion(request: Request):
    """Cerrar sesión de usuario"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")
    response = requests.post(f"{URL_SEGURIDAD}/seguridad/cerrar-sesion", headers={"Authorization": auth_header})
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al cerrar sesión")


# USUARIOS
@router.get("/usuarios")
async def obtener_usuarios(request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))):
    """Obtener todos los usuarios"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/seguridad/usuarios", headers={"Authorization": auth_header})
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json())
    return response.json()

@router.get("/usuarios/{id}")
async def obtener_usuario(id: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))):
    """Obtener un usuario por ID y su cuenta asociada si existe."""
    auth_header = request.headers.get("Authorization")
    response_usuario = requests.get(f"{URL_SEGURIDAD}/seguridad/usuarios/{id}", headers={"Authorization": auth_header})
    if response_usuario.status_code != 200:
        return HTTPException(status_code=response_usuario.status_code, detail="Error al obtener usuario")
    usuario_data = response_usuario.json()
    cuenta_id = usuario_data.get("accountId")
    if cuenta_id:
        response_cuenta = requests.get(f"{URL_FINANZAS}/finanzas/cuentas/{cuenta_id}", headers={"Authorization": auth_header})
        if response_cuenta.status_code == 200:
            usuario_data["account"] = response_cuenta.json()
        else:
            usuario_data["account"] = {"error": "No se pudo obtener la cuenta"}
    return usuario_data

@router.put("/usuarios/{id}")
async def actualizar_usuario(id: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))):
    """Actualizar usuario"""
    auth_header = request.headers.get("Authorization")
    data = await request.json()
    response = requests.put(
        f"{URL_SEGURIDAD}/seguridad/usuarios/{id}",
        json=data,
        headers={"Authorization": auth_header}
    )
    if response.status_code != 200:
        return HTTPException(status_code=response.status_code, detail="Error al actualizar usuario")
    return response.json()


@router.delete("/usuarios/{id}")
async def eliminar_usuario(id: str, request: Request,
                           token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))):
    """Eliminar usuario"""
    auth_header = request.headers.get("Authorization")
    response = requests.delete(f"{URL_SEGURIDAD}/seguridad/usuarios/{id}", headers={"Authorization": auth_header})

    # Si el código es 204 o 200, consideramos que la eliminación fue exitosa
    if response.status_code in [204, 200]:
        return {"mensaje": "Usuario eliminado correctamente"}
    else:
        # Aquí usamos raise en lugar de return
        raise HTTPException(status_code=response.status_code, detail=f"Error al eliminar usuario: {response.text}")


@router.put("/usuarios/{userId}/cuentas/{accountId}")
async def asignar_cuenta_a_usuario(userId: str, accountId: str, request: Request,
                                   token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Asigna una cuenta a un usuario en el sistema de seguridad."""
    auth_header = request.headers.get("Authorization")
    response = requests.put(
        f"{URL_SEGURIDAD}/seguridad/usuarios/{userId}/cuentas/{accountId}",
        headers={"Authorization": auth_header}
    )

    if response.status_code in [200, 201, 204]:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code,
                            detail=f"Error al asignar cuenta a usuario: {response.text}")

@router.put("/usuarios/{userId}/roles/{roleId}")
async def asignar_rol(userId: str, roleId: str, request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Asignar un rol a un usuario"""
    auth_header = request.headers.get("Authorization")
    response = requests.put(f"{URL_SEGURIDAD}/seguridad/usuarios/{userId}/roles/{roleId}", headers={"Authorization": auth_header})
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.put("/usuarios/{userId}/estados/{estadoId}")
async def asignar_estado_a_usuario(userId: str, estadoId: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN"]))):
    """Redirige la solicitud al backend de seguridad para asignar un estado a un usuario."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")
    response = requests.put(
        f"{URL_SEGURIDAD}/seguridad/usuarios/{userId}/estados/{estadoId}",
        headers={"Authorization": auth_header}
    )
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail=f"Error al asignar estado: {response.text}")

# ROLES
@router.post("/roles")
async def crear_rol(request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Crea un nuevo rol en el backend de seguridad"""
    auth_header = request.headers.get("Authorization")
    datos_rol = await request.json()
    response = requests.post(f"{URL_SEGURIDAD}/seguridad/roles", json=datos_rol, headers={"Authorization": auth_header})
    if response.status_code in [200, 201]:
        return response.json()
    return HTTPException(status_code=response.status_code, detail=f"Error al crear el rol: {response.text}")

@router.get("/roles")
async def obtener_roles(request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene todos los roles"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/seguridad/roles", headers={"Authorization": auth_header})
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Error al obtener roles")
    return response.json()

@router.get("/roles/{id}")
async def obtener_rol(id: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene un rol por su ID"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/seguridad/roles/{id}", headers={"Authorization": auth_header})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Rol no encontrado")

@router.get("/roles/name/{name}")
async def obtener_rol_por_nombre(name: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene un rol por su nombre"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/seguridad/roles/name/{name}", headers={"Authorization": auth_header})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Rol no encontrado")


@router.get("/roles/{id}/users")
async def obtener_usuarios_con_rol(id: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene los usuarios asociados a un rol"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/seguridad/roles/{id}/users", headers={"Authorization": auth_header})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Error al obtener usuarios del rol")

@router.put("/roles/{id}")
async def actualizar_rol(id: str, request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Actualizar un rol"""
    auth_header = request.headers.get("Authorization")
    datos = await request.json()
    response = requests.put(
        f"{URL_SEGURIDAD}/seguridad/roles/{id}",
        json=datos,
        headers={"Authorization": auth_header}
    )
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al actualizar rol")

@router.delete("/roles/{id}")
async def eliminar_rol(id: str, request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Eliminar un rol"""
    auth_header = request.headers.get("Authorization")
    response = requests.delete(f"{URL_SEGURIDAD}/seguridad/roles/{id}", headers={"Authorization": auth_header})
    if response.status_code == 204:
        return {"mensaje": "Rol eliminado correctamente"}
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al eliminar rol")

# PERMISOS
@router.get("/permisos")
async def obtener_permisos(request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene todos los permisos"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/seguridad/permisos", headers={"Authorization": auth_header})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Error al obtener permisos")

@router.get("/permisos/{id}")
async def obtener_permiso(id: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene un permiso por su ID"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/seguridad/permisos/{id}", headers={"Authorization": auth_header})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Permiso no encontrado")

@router.get("/permisos/nombre/{nombre}")
async def obtener_permiso_por_nombre(nombre: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene un permiso por su nombre"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/seguridad/permisos/nombre/{nombre}", headers={"Authorization": auth_header})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Permiso no encontrado")

@router.post("/permisos")
async def crear_permiso(request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Crea un nuevo permiso"""
    auth_header = request.headers.get("Authorization")
    datos = await request.json()
    response = requests.post(f"{URL_SEGURIDAD}/seguridad/permisos", json=datos, headers={"Authorization": auth_header})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Error al crear permiso")

@router.put("/permisos/{id}")
async def actualizar_permiso(id: str, request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Actualiza un permiso"""
    auth_header = request.headers.get("Authorization")
    datos = await request.json()
    response = requests.put(
        f"{URL_SEGURIDAD}/seguridad/permisos/{id}",
        json=datos,
        headers={"Authorization": auth_header}
    )
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Error al actualizar permiso")

@router.delete("/permisos/{id}")
async def eliminar_permiso(id: str, request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Elimina un permiso"""
    auth_header = request.headers.get("Authorization")
    response = requests.delete(f"{URL_SEGURIDAD}/seguridad/permisos/{id}", headers={"Authorization": auth_header})
    if response.status_code == 204:
        return {"mensaje": "Permiso eliminado correctamente"}
    raise HTTPException(status_code=response.status_code, detail="Error al eliminar permiso")

# ASIGNAR PERMISO A UN ROL
@router.put("/roles/{roleId}/permisos/{permissionId}")
async def asignar_permiso_a_rol(permissionId: str, roleId: str, request: Request,
                                token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Asigna un permiso a un rol"""
    try:
        print(f"🔍 Asignando permiso")
        print(f"📌 Role ID: {roleId}")
        print(f"📋 Permission ID: {permissionId}")
        print(f"🔐 Token info: {token_data}")

        auth_header = request.headers.get("Authorization")

        response = requests.put(
            f"{URL_SEGURIDAD}/seguridad/roles/{roleId}/permisos/{permissionId}",
            headers={
                "Authorization": auth_header,
                "Content-Type": "application/json"
            }
        )

        print(f"📡 Código de respuesta: {response.status_code}")
        print(f"📄 Contenido de respuesta: {response.text}")

        if response.status_code == 200:
            return response.json()

        raise HTTPException(
            status_code=response.status_code,
            detail=f"Error al asignar permiso al rol: {response.text}"
        )

    except requests.RequestException as req_error:
        print(f"❌ Error de solicitud: {str(req_error)}")
        raise HTTPException(status_code=500, detail=f"Error de comunicación: {str(req_error)}")
    except Exception as e:
        print(f"❌ Excepción global: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# ELIMINAR PERMISO DE UN ROL
@router.delete("/roles/{roleId}/permisos/{permissionId}")
async def eliminar_permiso_de_rol(permissionId: str, roleId: str, request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Elimina un permiso de un rol"""
    auth_header = request.headers.get("Authorization")
    response = requests.delete(
        f"{URL_SEGURIDAD}/seguridad/roles/{roleId}/permisos/{permissionId}",
        headers={"Authorization": auth_header}
    )
    if response.status_code == 200:
        return {"mensaje": "Permiso eliminado del rol correctamente"}
    raise HTTPException(status_code=response.status_code, detail="Error al eliminar permiso del rol")

# ESTADOS
@router.get("/estados")
async def obtener_estados(request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene todos los estados"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/seguridad/estados", headers={"Authorization": auth_header})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Error al obtener estados")

@router.get("/estados/{id}")
async def obtener_estado(id: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene un estado por ID"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/seguridad/estados/{id}", headers={"Authorization": auth_header})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Estado no encontrado")

@router.post("/estados")
async def crear_estado(request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Crea un nuevo estado en el sistema de seguridad."""
    auth_header = request.headers.get("Authorization")
    datos = await request.json()
    response = requests.post(f"{URL_SEGURIDAD}/seguridad/estados", json=datos, headers={"Authorization": auth_header})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Error al crear estado")

@router.put("/estados/{id}")
async def actualizar_estado(id: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Actualiza un estado en el sistema de seguridad."""
    auth_header = request.headers.get("Authorization")
    datos = await request.json()
    response = requests.put(
        f"{URL_SEGURIDAD}/seguridad/estados/{id}",
        json=datos,
        headers={"Authorization": auth_header}
    )
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Error al actualizar estado")

@router.delete("/estados/{id}")
async def eliminar_estado(id: str, request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Elimina un estado en el sistema de seguridad."""
    auth_header = request.headers.get("Authorization")
    response = requests.delete(f"{URL_SEGURIDAD}/seguridad/estados/{id}", headers={"Authorization": auth_header})
    if response.status_code == 204:
        return {"mensaje": "Estado eliminado correctamente"}
    raise HTTPException(status_code=response.status_code, detail="Error al eliminar estado")
async def eliminar_estado(id: str, request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Elimina un estado en el sistema de seguridad."""
    auth_header = request.headers.get("Authorization")
    response = requests.delete(f"{URL_SEGURIDAD}/seguridad/estados/{id}", headers={"Authorization": auth_header})
    if response.status_code == 204:
        return {"mensaje": "Estado eliminado correctamente"}
    raise HTTPException(status_code=response.status_code, detail="Error al eliminar estado")
