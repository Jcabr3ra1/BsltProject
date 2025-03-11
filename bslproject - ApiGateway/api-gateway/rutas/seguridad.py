import requests
from fastapi import APIRouter, Request, HTTPException, Depends
from middleware.autenticacion import verificar_token, verificar_rol, verificar_roles_permitidos
import json

# Cargar configuración
with open("configuracion/config.json", "r") as archivo_config:
    configuracion = json.load(archivo_config)

URL_SEGURIDAD = configuracion["servicios"]["seguridad"]
URL_FINANZAS = configuracion["servicios"]["finanzas"]

router = APIRouter()

# USUARIOS
@router.post("/seguridad/usuarios/login")
async def login(request: Request):
    """Autenticar usuario"""
    datos = await request.json()
    response = requests.post(f"{URL_SEGURIDAD}/usuarios/login", json=datos)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error en autenticación")

@router.post("/seguridad/usuarios/registro")
async def registrar_usuario(request: Request):
    """Registrar un nuevo usuario (abierto para todos)"""
    datos = await request.json()
    response = requests.post(f"{URL_SEGURIDAD}/usuarios/registro", json=datos)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al registrar usuario")

@router.get("/seguridad/usuarios")
async def obtener_usuarios(request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))):
    """Obtener todos los usuarios"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/usuarios", headers={"Authorization": auth_header})
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json())
    return response.json()

@router.get("/seguridad/usuarios/{id}")
async def obtener_usuario(id: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))):
    """Obtener un usuario por ID y su cuenta asociada si existe."""
    auth_header = request.headers.get("Authorization")
    response_usuario = requests.get(f"{URL_SEGURIDAD}/usuarios/{id}", headers={"Authorization": auth_header})
    if response_usuario.status_code != 200:
        return HTTPException(status_code=response_usuario.status_code, detail="Error al obtener usuario")
    usuario_data = response_usuario.json()
    cuenta_id = usuario_data.get("cuentaId")
    if cuenta_id:
        response_cuenta = requests.get(f"{URL_FINANZAS}/cuentas/{cuenta_id}", headers={"Authorization": auth_header})
        if response_cuenta.status_code == 200:
            usuario_data["cuenta"] = response_cuenta.json()
        else:
            usuario_data["cuenta"] = {"error": "No se pudo obtener la cuenta"}
    return usuario_data

@router.put("/seguridad/usuarios/{id}")
async def actualizar_usuario(id: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))):
    """Actualizar usuario"""
    auth_header = request.headers.get("Authorization")
    data = await request.json()
    response = requests.put(
        f"{URL_SEGURIDAD}/usuarios/{id}",
        json=data,
        headers={"Authorization": auth_header}
    )
    if response.status_code != 200:
        return HTTPException(status_code=response.status_code, detail="Error al actualizar usuario")
    return response.json()

@router.delete("/seguridad/usuarios/{id}")
async def eliminar_usuario(id: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))):
    """Eliminar usuario"""
    auth_header = request.headers.get("Authorization")
    response = requests.delete(f"{URL_SEGURIDAD}/usuarios/{id}", headers={"Authorization": auth_header})
    if response.status_code == 204:
        return {"mensaje": "Usuario eliminado correctamente"}
    else:
        return HTTPException(status_code=response.status_code, detail="Error al eliminar usuario")

@router.put("/seguridad/usuarios/{usuarioId}/asignar-rol/{rolId}")
async def asignar_rol(usuarioId: str, rolId: str, request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Asignar un rol a un usuario"""
    auth_header = request.headers.get("Authorization")
    response = requests.put(f"{URL_SEGURIDAD}/usuarios/{usuarioId}/asignar-rol/{rolId}", headers={"Authorization": auth_header})
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.put("/seguridad/usuarios/{id}/asignar-estado/{estadoId}")
async def asignar_estado_a_usuario(id: str, estadoId: str, request: Request):
    """Redirige la solicitud al backend de seguridad para asignar un estado a un usuario."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")
    response = requests.put(
        f"{URL_SEGURIDAD}/usuarios/{id}/asignar-estado/{estadoId}",
        headers={"Authorization": auth_header}
    )
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail=f"Error al asignar estado: {response.text}")

# ROLES
@router.post("/seguridad/roles")
async def crear_rol(request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Crea un nuevo rol en el backend de seguridad"""
    auth_header = request.headers.get("Authorization")
    datos_rol = await request.json()
    response = requests.post(f"{URL_SEGURIDAD}/roles", json=datos_rol, headers={"Authorization": auth_header})
    if response.status_code in [200, 201]:
        return response.json()
    return HTTPException(status_code=response.status_code, detail=f"Error al crear el rol: {response.text}")

@router.get("/seguridad/roles")
async def obtener_roles(request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene todos los roles"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/roles", headers={"Authorization": auth_header})
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Error al obtener roles")
    return response.json()

@router.get("/seguridad/roles/{id}")
async def obtener_rol(id: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene un rol por su ID"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/roles/{id}", headers={"Authorization": auth_header})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Rol no encontrado")

@router.get("/seguridad/roles/nombre/{nombre}")
async def obtener_rol_por_nombre(nombre: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene un rol por su nombre"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/roles/nombre/{nombre}", headers={"Authorization": auth_header})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Rol no encontrado")

@router.get("/seguridad/roles/{id}/permisos")
async def obtener_permisos_de_rol(id: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene los permisos de un rol"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/roles/{id}/permisos", headers={"Authorization": auth_header})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Error al obtener permisos del rol")

@router.get("/seguridad/roles/{id}/usuarios")
async def obtener_usuarios_con_rol(id: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene los usuarios asociados a un rol"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/roles/{id}/usuarios", headers={"Authorization": auth_header})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Error al obtener usuarios del rol")

@router.put("/seguridad/roles/{id}")
async def actualizar_rol(id: str, request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Actualizar un rol"""
    auth_header = request.headers.get("Authorization")
    datos = await request.json()
    response = requests.put(
        f"{URL_SEGURIDAD}/roles/{id}",
        json=datos,
        headers={"Authorization": auth_header}
    )
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al actualizar rol")

@router.delete("/seguridad/roles/{id}")
async def eliminar_rol(id: str, request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Eliminar un rol"""
    auth_header = request.headers.get("Authorization")
    response = requests.delete(f"{URL_SEGURIDAD}/roles/{id}", headers={"Authorization": auth_header})
    if response.status_code == 204:
        return {"mensaje": "Rol eliminado correctamente"}
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al eliminar rol")

# PERMISOS
@router.get("/seguridad/permisos")
async def obtener_permisos(request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene todos los permisos"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/permisos", headers={"Authorization": auth_header})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Error al obtener permisos")

@router.get("/seguridad/permisos/{id}")
async def obtener_permiso(id: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene un permiso por ID"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/permisos/{id}", headers={"Authorization": auth_header})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Permiso no encontrado")

@router.get("/seguridad/permisos/nombre/{nombre}")
async def obtener_permiso_por_nombre(nombre: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene un permiso por su nombre"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/permisos/nombre/{nombre}", headers={"Authorization": auth_header})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Permiso no encontrado")

@router.post("/seguridad/permisos")
async def crear_permiso(request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Crea un nuevo permiso"""
    auth_header = request.headers.get("Authorization")
    datos = await request.json()
    response = requests.post(
        f"{URL_SEGURIDAD}/permisos",
        json=datos,
        headers={"Authorization": auth_header}
    )
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Error al crear permiso")

@router.put("/seguridad/permisos/{id}")
async def actualizar_permiso(id: str, request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Actualiza un permiso"""
    auth_header = request.headers.get("Authorization")
    datos = await request.json()
    response = requests.put(
        f"{URL_SEGURIDAD}/permisos/{id}",
        json=datos,
        headers={"Authorization": auth_header}
    )
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Error al actualizar permiso")

@router.delete("/seguridad/permisos/{id}")
async def eliminar_permiso(id: str, request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Elimina un permiso"""
    auth_header = request.headers.get("Authorization")
    response = requests.delete(
        f"{URL_SEGURIDAD}/permisos/{id}",
        headers={"Authorization": auth_header}
    )
    if response.status_code == 204:
        return {"mensaje": "Permiso eliminado correctamente"}
    raise HTTPException(status_code=response.status_code, detail="Error al eliminar permiso")

# ASIGNAR PERMISO A UN ROL
@router.put("/seguridad/permisos/{permiso_id}/asignar-a-rol/{rol_id}")
async def asignar_permiso_a_rol(permiso_id: str, rol_id: str, request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Asigna un permiso a un rol"""
    auth_header = request.headers.get("Authorization")
    response = requests.put(
        f"{URL_SEGURIDAD}/permisos/{permiso_id}/asignar-a-rol/{rol_id}",
        headers={"Authorization": auth_header}
    )
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Error al asignar permiso al rol")

# ELIMINAR PERMISO DE UN ROL
@router.delete("/seguridad/permisos/{permiso_id}/eliminar-de-rol/{rol_id}")
async def eliminar_permiso_de_rol(permiso_id: str, rol_id: str, request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Elimina un permiso de un rol"""
    auth_header = request.headers.get("Authorization")
    response = requests.delete(
        f"{URL_SEGURIDAD}/permisos/{permiso_id}/eliminar-de-rol/{rol_id}",
        headers={"Authorization": auth_header}
    )
    if response.status_code == 204:
        return {"mensaje": "Permiso eliminado correctamente del rol"}
    raise HTTPException(status_code=response.status_code, detail="Error al eliminar permiso del rol")

# ESTADOS
@router.get("/seguridad/estados")
async def obtener_estados(request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene todos los estados"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(
        f"{URL_SEGURIDAD}/estados",
        headers={"Authorization": auth_header}
    )
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Error al obtener estados")

@router.get("/seguridad/estados/{id}")
async def obtener_estado(id: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Obtiene un estado por ID"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(
        f"{URL_SEGURIDAD}/estados/{id}",
        headers={"Authorization": auth_header}
    )
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail="Estado no encontrado")

@router.post("/seguridad/estados")
async def crear_estado(request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Crea un nuevo estado en el sistema de seguridad."""
    datos = await request.json()
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")
    response = requests.post(f"{URL_SEGURIDAD}/estados", json=datos, headers={"Authorization": auth_header, "Content-Type": "application/json"})
    if response.status_code in [200, 201]:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail=f"Error al crear estado: {response.text}")

@router.put("/seguridad/estados/{id}")
async def actualizar_estado(id: str, request: Request, token_data: dict = Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))):
    """Actualiza un estado en el sistema de seguridad."""
    datos = await request.json()
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")
    response = requests.put(f"{URL_SEGURIDAD}/estados/{id}", json=datos, headers={"Authorization": auth_header, "Content-Type": "application/json"})
    if response.status_code == 200:
        return response.json()
    raise HTTPException(status_code=response.status_code, detail=f"Error al actualizar estado: {response.text}")

@router.delete("/seguridad/estados/{id}")
async def eliminar_estado(id: str, request: Request, token_data: dict = Depends(verificar_rol("ADMIN"))):
    """Elimina un estado en el sistema de seguridad."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")
    response = requests.delete(f"{URL_SEGURIDAD}/estados/{id}", headers={"Authorization": auth_header})
    if response.status_code == 204:
        return {"mensaje": "Estado eliminado correctamente"}
    raise HTTPException(status_code=response.status_code, detail=f"Error al eliminar estado: {response.text}")
