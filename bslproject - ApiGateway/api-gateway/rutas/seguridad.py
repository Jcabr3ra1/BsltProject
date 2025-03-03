import requests
from fastapi import APIRouter, Request, HTTPException, Depends
import json
from middleware.autenticacion import verificar_token

# 📌 Cargar configuración
with open("configuracion/config.json", "r") as archivo_config:
    configuracion = json.load(archivo_config)

URL_SEGURIDAD = configuracion["servicios"]["seguridad"]

router = APIRouter()

####################################### USUARIOS #######################################
# ✅ LOGIN DE USUARIO
@router.post("/seguridad/usuarios/login")
async def login(request: Request):
    datos = await request.json()
    response = requests.post(f"{URL_SEGURIDAD}/usuarios/login", json=datos)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error en autenticación")

# ✅ REGISTRAR USUARIO
@router.post("/seguridad/usuarios/registro")
async def registrar_usuario(request: Request):
    datos = await request.json()
    response = requests.post(f"{URL_SEGURIDAD}/usuarios/registro", json=datos)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al registrar usuario")

# ✅ OBTENER TODOS LOS USUARIOS
@router.get("/seguridad/usuarios")
async def obtener_usuarios(token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    print(f"📢 Enviando solicitud a {URL_SEGURIDAD}/usuarios con token: {token}")

    response = requests.get(f"{URL_SEGURIDAD}/usuarios", headers=headers)

    print(f"📢 Respuesta del backend de seguridad: {response.status_code} - {response.text}")

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al obtener usuarios")

# ✅ OBTENER USUARIO POR ID
@router.get("/seguridad/usuarios/{id}")
async def obtener_usuario(id: str, token: str = Depends(verificar_token)):  # ⬅ Corrección de `token`
    headers = {"Authorization": f"Bearer {token}"}

    print(f"📢 Enviando solicitud a {URL_SEGURIDAD}/usuarios/{id} con token: {token}")

    response = requests.get(f"{URL_SEGURIDAD}/usuarios/{id}", headers=headers)

    print(
        f"📢 Respuesta del backend de seguridad: {response.status_code} - {response.text}")  # ⬅ Ver qué devuelve el backend

    if response.status_code == 200:
        return response.json()  # ⬅ Devolver la respuesta del backend
    else:
        raise HTTPException(status_code=response.status_code, detail="Usuario no encontrado")

# ✅ ACTUALIZAR USUARIO
@router.put("/seguridad/usuarios/{id}")
async def actualizar_usuario(id: str, request: Request, token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    data = await request.json()

    print(f"📢 Enviando solicitud PUT a {URL_SEGURIDAD}/usuarios/{id} con token: {token}")
    print(f"📢 Datos enviados: {data}")

    response = requests.put(f"{URL_SEGURIDAD}/usuarios/{id}", json=data, headers=headers)

    print(f"📢 Respuesta del backend: {response.status_code} - {response.text}")

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al actualizar usuario")

# ✅ ELIMINAR USUARIO
@router.delete("/seguridad/usuarios/{id}")
async def eliminar_usuario(id: str, token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(f"{URL_SEGURIDAD}/usuarios/{id}", headers=headers)

    if response.status_code == 204:
        return {"mensaje": "Usuario eliminado correctamente"}
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al eliminar usuario")


@router.put("/seguridad/usuarios/{usuarioId}/asignar-rol/{rolId}")
async def asignar_rol(usuarioId: str, rolId: str, token: str = Depends(verificar_token)):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    url = f"{URL_SEGURIDAD}/usuarios/{usuarioId}/asignar-rol/{rolId}"
    response = requests.put(url, headers=headers)

    if response.status_code == 200:
        return response.json()

    error_detail = response.json() if response.content else "Error desconocido"
    raise HTTPException(status_code=response.status_code, detail=error_detail)


# ✅ ASIGNAR PERMISO A UN USUARIO
@router.put("/seguridad/usuarios/{usuarioId}/asignar-cuenta/{cuentaId}")
async def asignar_cuenta(usuarioId: str, cuentaId: str, token: str = Depends(verificar_token)):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    url = f"{URL_SEGURIDAD}/usuarios/{usuarioId}/asignar-cuenta/{cuentaId}"
    response = requests.put(url, headers=headers)

    if response.status_code == 200:
        return response.json()

    error_detail = response.json() if response.content else "Error desconocido"
    raise HTTPException(status_code=response.status_code, detail=error_detail)



# ✅ ASIGNAR ESTADO A UN USUARIO
@router.put("/seguridad/usuarios/{usuarioId}/asignar-estado/{estado}")
async def asignar_estado(usuarioId: str, estado: str, token: str = Depends(verificar_token)):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    url = f"{URL_SEGURIDAD}/usuarios/{usuarioId}/asignar-estado/{estado}"
    response = requests.put(url, headers=headers)

    if response.status_code == 200:
        return response.json()

    error_detail = response.json() if response.content else "Error desconocido"
    raise HTTPException(status_code=response.status_code, detail=error_detail)

####################################### ROL #######################################
# ✅ OBTENER TODOS LOS ROLES
@router.get("/seguridad/roles")
async def obtener_roles(token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_SEGURIDAD}/roles", headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al obtener roles")

# ✅ OBTENER UN ROL POR ID
@router.get("/seguridad/roles/{id}")
async def obtener_rol(id: str, token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_SEGURIDAD}/roles/{id}", headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Rol no encontrado")

# ✅ OBTENER UN ROL POR NOMBRE
@router.get("/seguridad/roles/nombre/{nombre}")
async def obtener_rol_por_nombre(nombre: str, token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_SEGURIDAD}/roles/nombre/{nombre}", headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Rol no encontrado")

# ✅ OBTENER PERMISOS DE UN ROL
@router.get("/seguridad/roles/{id}/permisos")
async def obtener_permisos_de_rol(id: str, token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_SEGURIDAD}/roles/{id}/permisos", headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al obtener permisos del rol")

# ✅ OBTENER USUARIOS ASOCIADOS A UN ROL
@router.get("/seguridad/roles/{id}/usuarios")
async def obtener_usuarios_con_rol(id: str, token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_SEGURIDAD}/roles/{id}/usuarios", headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al obtener usuarios del rol")

# ✅ ASIGNAR PERMISO A UN ROL
@router.put("/seguridad/roles/asignar-permiso/{rolId}/{permisoId}")
async def asignar_permiso_a_rol(rolId: str, permisoId: str, token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(f"{URL_SEGURIDAD}/roles/asignar-permiso/{rolId}/{permisoId}", headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al asignar permiso al rol")

####################################### PERMISO ROL #######################################
# ✅ OBTENER TODOS LOS PERMISOS-ROLES
@router.get("/seguridad/permisos-roles")
async def obtener_permisos_roles(token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_SEGURIDAD}/permisos-roles", headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al obtener permisos-roles")

# ✅ OBTENER UN PERMISO-ROL POR ID
@router.get("/seguridad/permisos-roles/{id}")
async def obtener_permiso_rol(id: str, token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_SEGURIDAD}/permisos-roles/{id}", headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Permiso-Rol no encontrado")

# ✅ ASIGNAR MÚLTIPLES PERMISOS A UN ROL
@router.put("/seguridad/permisos-roles/asignar-multiples/{rolId}")
async def asignar_multiples_permisos(rolId: str, request: Request, token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    datos = await request.json()
    response = requests.put(f"{URL_SEGURIDAD}/permisos-roles/asignar-multiples/{rolId}", json=datos, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al asignar permisos al rol")

####################################### PERMISO #######################################
# ✅ OBTENER TODOS LOS PERMISOS
@router.get("/seguridad/permisos")
async def obtener_permisos(token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_SEGURIDAD}/permisos", headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al obtener permisos")

# ✅ OBTENER UN PERMISO POR ID
@router.get("/seguridad/permisos/{id}")
async def obtener_permiso(id: str, token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_SEGURIDAD}/permisos/{id}", headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Permiso no encontrado")

# ✅ OBTENER UN PERMISO POR NOMBRE
@router.get("/seguridad/permisos/nombre/{nombre}")
async def obtener_permiso_por_nombre(nombre: str, token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_SEGURIDAD}/permisos/nombre/{nombre}", headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Permiso no encontrado")

# ✅ CREAR UN NUEVO PERMISO
@router.post("/seguridad/permisos")
async def crear_permiso(request: Request, token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    datos = await request.json()
    response = requests.post(f"{URL_SEGURIDAD}/permisos", json=datos, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al crear permiso")

# ✅ ACTUALIZAR UN PERMISO
@router.put("/seguridad/permisos/{id}")
async def actualizar_permiso(id: str, request: Request, token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    datos = await request.json()
    response = requests.put(f"{URL_SEGURIDAD}/permisos/{id}", json=datos, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al actualizar permiso")

# ✅ ELIMINAR UN PERMISO
@router.delete("/seguridad/permisos/{id}")
async def eliminar_permiso(id: str, token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(f"{URL_SEGURIDAD}/permisos/{id}", headers=headers)

    if response.status_code == 204:
        return {"mensaje": "Permiso eliminado correctamente"}
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al eliminar permiso")

####################################### ESTADO #######################################
# ✅ OBTENER TODOS LOS ESTADOS
@router.get("/seguridad/estados")
async def obtener_estados(token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_SEGURIDAD}/estados", headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al obtener estados")

# ✅ OBTENER UN ESTADO POR ID
@router.get("/seguridad/estados/{id}")
async def obtener_estado(id: str, token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_SEGURIDAD}/estados/{id}", headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Estado no encontrado")

# ✅ CREAR UN NUEVO ESTADO
@router.post("/seguridad/estados")
async def crear_estado(request: Request, token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    datos = await request.json()
    response = requests.post(f"{URL_SEGURIDAD}/estados", json=datos, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al crear estado")

# ✅ ACTUALIZAR UN ESTADO
@router.put("/seguridad/estados/{id}")
async def actualizar_estado(id: str, request: Request, token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    datos = await request.json()
    response = requests.put(f"{URL_SEGURIDAD}/estados/{id}", json=datos, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al actualizar estado")

# ✅ ELIMINAR UN ESTADO
@router.delete("/seguridad/estados/{id}")
async def eliminar_estado(id: str, token: str = Depends(verificar_token)):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(f"{URL_SEGURIDAD}/estados/{id}", headers=headers)

    if response.status_code == 204:
        return {"mensaje": "Estado eliminado correctamente"}
    else:
        raise HTTPException(status_code=response.status_code, detail="Error al eliminar estado")
