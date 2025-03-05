import requests
from fastapi import APIRouter, Request, HTTPException, Depends
import json
from middleware.autenticacion import verificar_rol, verificar_roles_permitidos

# 📌 Cargar configuración
with open("configuracion/config.json", "r") as archivo_config:
    configuracion = json.load(archivo_config)

URL_SEGURIDAD = configuracion["servicios"]["seguridad"]
URL_FINANZAS = configuracion["servicios"]["finanzas"]

router = APIRouter()

####################################### ✅ USUARIOS #######################################

@router.post("/seguridad/usuarios/login")
async def login(request: Request):
    """Autenticación de usuario"""
    datos = await request.json()
    response = requests.post(f"{URL_SEGURIDAD}/usuarios/login", json=datos)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error en autenticación")

@router.post("/seguridad/usuarios/registro")
async def registrar_usuario(request: Request):
    """Registrar un nuevo usuario (abierto para todos)"""
    datos = await request.json()
    response = requests.post(f"{URL_SEGURIDAD}/usuarios/registro", json=datos)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al registrar usuario")


@router.get("/seguridad/usuarios", dependencies=[Depends(verificar_rol("ADMIN"))])
async def obtener_usuarios(request: Request):
    """Obtener todos los usuarios"""
    print(f"📢 Solicitud recibida para obtener usuarios")  # 🔥 Debug

    # 🔍 Verificar si la API de seguridad está recibiendo el token correctamente
    auth_header = request.headers.get("Authorization")
    print(f"🔍 Token recibido en Seguridad: {auth_header}")  # 🔥 Debug

    response = requests.get(f"{URL_SEGURIDAD}/usuarios", headers={"Authorization": auth_header})

    if response.status_code != 200:
        print(f"❌ Error al obtener usuarios: {response.status_code}, {response.text}")  # 🔥 Debug
        raise HTTPException(status_code=response.status_code, detail=response.json())

    return response.json()


@router.get("/seguridad/usuarios/{id}",
            dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_usuario(id: str, request: Request):
    """Obtener un usuario por ID y su cuenta asociada si existe."""
    auth_header = request.headers.get("Authorization")  # Obtener el token recibido
    print(f"📢 Solicitando usuario {id} con token: {auth_header}")  # 🔥 Debug

    # 1️⃣ Reenviar la solicitud al backend de Seguridad
    response_usuario = requests.get(f"{URL_SEGURIDAD}/usuarios/{id}", headers={"Authorization": auth_header})

    if response_usuario.status_code != 200:
        return HTTPException(status_code=response_usuario.status_code, detail="Error al obtener usuario")

    usuario_data = response_usuario.json()

    # 2️⃣ Verificar si el usuario tiene una cuenta asignada
    cuenta_id = usuario_data.get("cuentaId")
    if cuenta_id:
        print(f"🔍 Usuario tiene cuenta: {cuenta_id}, obteniendo detalles desde Finanzas")

        response_cuenta = requests.get(f"{URL_FINANZAS}/cuentas/{cuenta_id}", headers={"Authorization": auth_header})

        if response_cuenta.status_code == 200:
            usuario_data["cuenta"] = response_cuenta.json()  # 🔥 Agregar los datos de la cuenta
        else:
            usuario_data["cuenta"] = {"error": "No se pudo obtener la cuenta"}

    return usuario_data


@router.put("/seguridad/usuarios/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def actualizar_usuario(id: str, request: Request):
    """Actualizar usuario"""
    auth_header = request.headers.get("Authorization")  # Obtener token
    data = await request.json()

    print(f"📢 Solicitando actualización de usuario {id} con token: {auth_header}")  # 🔥 Debug

    response = requests.put(
        f"{URL_SEGURIDAD}/usuarios/{id}",
        json=data,
        headers={"Authorization": auth_header}  # Reenviar el token
    )

    print(f"🔍 Respuesta del backend: {response.status_code} - {response.text}")  # 🔥 Debug

    if response.status_code != 200:
        return HTTPException(status_code=response.status_code, detail="Error al actualizar usuario")

    return response.json()

@router.delete("/seguridad/usuarios/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def eliminar_usuario(id: str, request: Request):
    """Eliminar usuario"""
    auth_header = request.headers.get("Authorization")  # ✅ Obtener token
    response = requests.delete(f"{URL_SEGURIDAD}/usuarios/{id}", headers={"Authorization": auth_header})

    if response.status_code == 204:
        return {"mensaje": "Usuario eliminado correctamente"}
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)

@router.put("/seguridad/usuarios/{usuarioId}/asignar-rol/{rolId}", dependencies=[Depends(verificar_rol("ADMIN"))])
async def asignar_rol(usuarioId: str, rolId: str, request: Request):
    """Asignar un rol a un usuario"""
    auth_header = request.headers.get("Authorization")  # Obtener token
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


####################################### ✅ ROLES #######################################
@router.post("/seguridad/roles", dependencies=[Depends(verificar_rol("ADMIN"))])
async def crear_rol(request: Request):
    """Crea un nuevo rol en el backend de seguridad"""
    auth_header = request.headers.get("Authorization")  # ✅ Extrae el token
    datos_rol = await request.json()  # ✅ Obtener el body de la petición

    print(f"🔍 Datos recibidos en API Gateway: {datos_rol}")  # 🔥 Debug
    print(f"🔍 Enviando solicitud a {URL_SEGURIDAD}/roles con headers {auth_header}")  # 🔥 Debug

    response = requests.post(f"{URL_SEGURIDAD}/roles", json=datos_rol, headers={"Authorization": auth_header})

    print(f"📢 Respuesta del backend: {response.status_code} - {response.text}")  # 🔥 Debug

    if response.status_code in [200, 201]:  # ✅ Aceptar tanto 200 como 201
        return response.json()

    return HTTPException(status_code=response.status_code, detail=f"Error al crear el rol: {response.text}")

@router.get("/seguridad/roles", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def obtener_roles(request: Request):
    """Obtiene todos los roles"""
    auth_header = request.headers.get("Authorization")  # ✅ Obtener el token
    response = requests.get(f"{URL_SEGURIDAD}/roles", headers={"Authorization": auth_header})

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Error al obtener roles")

    return response.json()

@router.get("/seguridad/roles/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def obtener_rol(id: str, request: Request):
    """Obtiene un rol por su ID"""
    auth_header = request.headers.get("Authorization")  # ✅ Asegurar que el token se pasa
    response = requests.get(f"{URL_SEGURIDAD}/roles/{id}", headers={"Authorization": auth_header})

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail="Rol no encontrado")

@router.get("/seguridad/roles/nombre/{nombre}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def obtener_rol_por_nombre(nombre: str, request: Request):
    """Obtiene un rol por su nombre"""
    auth_header = request.headers.get("Authorization")  # ✅ Asegurar que el token se pase
    response = requests.get(f"{URL_SEGURIDAD}/roles/nombre/{nombre}", headers={"Authorization": auth_header})

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail="Rol no encontrado")


@router.get("/seguridad/roles/{id}/permisos",
            dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def obtener_permisos_de_rol(id: str, request: Request):
    """Obtiene los permisos de un rol"""
    auth_header = request.headers.get("Authorization")
    response = requests.get(f"{URL_SEGURIDAD}/roles/{id}/permisos", headers={"Authorization": auth_header})

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail="Error al obtener permisos del rol")


@router.get("/seguridad/roles/{id}/usuarios",
            dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def obtener_usuarios_con_rol(id: str, request: Request):
    """Obtiene los usuarios asociados a un rol"""
    auth_header = request.headers.get("Authorization")  # ✅ Obtener token del request
    response = requests.get(f"{URL_SEGURIDAD}/roles/{id}/usuarios", headers={"Authorization": auth_header})

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail="Error al obtener usuarios del rol")

@router.put("/seguridad/roles/{id}", dependencies=[Depends(verificar_rol("ADMIN"))])
async def actualizar_rol(id: str, request: Request):
    """Actualizar un rol"""
    auth_header = request.headers.get("Authorization")  # ✅ Obtener token
    datos = await request.json()  # ✅ Obtener datos enviados en la solicitud

    response = requests.put(
        f"{URL_SEGURIDAD}/roles/{id}",
        json=datos,
        headers={"Authorization": auth_header}
    )

    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)

@router.delete("/seguridad/roles/{id}", dependencies=[Depends(verificar_rol("ADMIN"))])
async def eliminar_rol(id: str, request: Request):
    """Eliminar un rol"""
    auth_header = request.headers.get("Authorization")  # ✅ Obtener token
    response = requests.delete(f"{URL_SEGURIDAD}/roles/{id}", headers={"Authorization": auth_header})

    if response.status_code == 204:
        return {"mensaje": "Rol eliminado correctamente"}
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)

####################################### ✅ PERMISOS-ROLES #######################################

# ✅ OBTENER TODOS LOS PERMISOS-ROLES
@router.get("/seguridad/permisos-roles", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def obtener_permisos_roles(request: Request):
    """Obtiene todos los permisos-roles"""
    auth_header = request.headers.get("Authorization")

    response = requests.get(
        f"{URL_SEGURIDAD}/permisos-roles",
        headers={"Authorization": auth_header}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail="Error al obtener permisos-roles")


# ✅ OBTENER UN PERMISO-ROL POR ID
@router.get("/seguridad/permisos-roles/{id}",
            dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def obtener_permiso_rol(id: str, request: Request):
    """Obtiene un permiso-rol por ID"""
    auth_header = request.headers.get("Authorization")

    response = requests.get(
        f"{URL_SEGURIDAD}/permisos-roles/{id}",
        headers={"Authorization": auth_header}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail="Permiso-Rol no encontrado")


# ✅ ASIGNAR MÚLTIPLES PERMISOS A UN ROL
@router.put("/seguridad/permisos-roles/asignar-multiples/{rolId}", dependencies=[Depends(verificar_rol("ADMIN"))])
async def asignar_multiples_permisos(rolId: str, request: Request):
    """Asigna múltiples permisos a un rol, validando que existan"""
    auth_header = request.headers.get("Authorization")
    datos = await request.json()

    # 🔍 Validar si el rol existe en el backend
    rol_response = requests.get(f"{URL_SEGURIDAD}/roles/{rolId}", headers={"Authorization": auth_header})
    if rol_response.status_code != 200:
        raise HTTPException(status_code=404, detail=f"Rol con ID {rolId} no encontrado")

    # 🔍 Validar si los permisos existen en el backend
    permisos_validos = []
    for permiso in datos.get("permisos", []):
        permiso_response = requests.get(f"{URL_SEGURIDAD}/permisos/nombre/{permiso}", headers={"Authorization": auth_header})
        if permiso_response.status_code == 200:
            permisos_validos.append(permiso)

    if not permisos_validos:
        raise HTTPException(status_code=404, detail="Ningún permiso válido fue encontrado en la base de datos")

    # ✅ Enviar solo permisos válidos al backend de seguridad
    response = requests.put(
        f"{URL_SEGURIDAD}/permisos-roles/asignar-multiples/{rolId}",
        json={"permisos": permisos_validos},
        headers={"Authorization": auth_header}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail="Error al asignar permisos al rol")

# ✅ CREAR UN PERMISO-ROL
@router.post("/seguridad/permisos-roles", dependencies=[Depends(verificar_rol("ADMIN"))])
async def crear_permiso_rol(request: Request):
    """Crea un nuevo permiso-rol"""
    auth_header = request.headers.get("Authorization")
    datos = await request.json()

    # ✅ Validar que rolId y permisoId están presentes y no son vacíos
    if "rolId" not in datos or not datos["rolId"]:
        raise HTTPException(status_code=400, detail="❌ Error: rolId es obligatorio")

    if "permisoId" not in datos or not datos["permisoId"]:
        raise HTTPException(status_code=400, detail="❌ Error: permisoId es obligatorio")

    response = requests.post(
        f"{URL_SEGURIDAD}/permisos-roles",
        json={"rolId": datos["rolId"], "permisoId": datos["permisoId"]},
        headers={"Authorization": auth_header}
    )

    if response.status_code in [200, 201]:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail="Error al crear el permiso-rol")

# ✅ ACTUALIZAR UN PERMISO-ROL
@router.put("/seguridad/permisos-roles/{id}", dependencies=[Depends(verificar_rol("ADMIN"))])
async def actualizar_permiso_rol(id: str, request: Request):
    """Actualiza un permiso-rol"""
    auth_header = request.headers.get("Authorization")
    datos = await request.json()

    response = requests.put(
        f"{URL_SEGURIDAD}/permisos-roles/{id}",
        json=datos,
        headers={"Authorization": auth_header}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail="Error al actualizar el permiso-rol")


# ✅ ELIMINAR UN PERMISO-ROL
@router.delete("/seguridad/permisos-roles/{id}", dependencies=[Depends(verificar_rol("ADMIN"))])
async def eliminar_permiso_rol(id: str, request: Request):
    """Elimina un permiso-rol"""
    auth_header = request.headers.get("Authorization")

    response = requests.delete(
        f"{URL_SEGURIDAD}/permisos-roles/{id}",
        headers={"Authorization": auth_header}
    )

    if response.status_code == 204:
        return {"mensaje": "Permiso-Rol eliminado correctamente"}

    raise HTTPException(status_code=response.status_code, detail="Error al eliminar el permiso-rol")


####################################### ✅ PERMISOS #######################################

@router.get("/seguridad/permisos", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def obtener_permisos(request: Request):
    """Obtiene todos los permisos"""
    auth_header = request.headers.get("Authorization")  # ✅ Obtener el token del request
    response = requests.get(f"{URL_SEGURIDAD}/permisos", headers={"Authorization": auth_header})

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail="Error al obtener permisos")


@router.get("/seguridad/permisos/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def obtener_permiso(id: str, request: Request):
    """Obtiene un permiso por ID"""
    auth_header = request.headers.get("Authorization")  # ✅ Obtener el token del request
    response = requests.get(f"{URL_SEGURIDAD}/permisos/{id}", headers={"Authorization": auth_header})

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail="Permiso no encontrado")


@router.get("/seguridad/permisos/nombre/{nombre}",
            dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def obtener_permiso_por_nombre(nombre: str, request: Request):
    """Obtiene un permiso por su nombre"""
    auth_header = request.headers.get("Authorization")  # ✅ Obtener el token del request
    response = requests.get(f"{URL_SEGURIDAD}/permisos/nombre/{nombre}", headers={"Authorization": auth_header})

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail="Permiso no encontrado")

@router.post("/seguridad/permisos", dependencies=[Depends(verificar_rol("ADMIN"))])
async def crear_permiso(request: Request):
    """Crea un nuevo permiso"""
    auth_header = request.headers.get("Authorization")  # ✅ Obtener el token del request
    datos = await request.json()  # ✅ Obtener los datos del nuevo permiso

    response = requests.post(
        f"{URL_SEGURIDAD}/permisos",
        json=datos,
        headers={"Authorization": auth_header}  # ✅ Enviar el token al backend de seguridad
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail="Error al crear permiso")

@router.put("/seguridad/permisos/{id}", dependencies=[Depends(verificar_rol("ADMIN"))])
async def actualizar_permiso(id: str, request: Request):
    """Actualiza un permiso"""
    auth_header = request.headers.get("Authorization")  # ✅ Obtener el token del request
    datos = await request.json()  # ✅ Obtener los datos a actualizar

    response = requests.put(
        f"{URL_SEGURIDAD}/permisos/{id}",
        json=datos,
        headers={"Authorization": auth_header}  # ✅ Enviar el token al backend de seguridad
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail="Error al actualizar permiso")

@router.delete("/seguridad/permisos/{id}", dependencies=[Depends(verificar_rol("ADMIN"))])
async def eliminar_permiso(id: str, request: Request):
    """Elimina un permiso"""
    auth_header = request.headers.get("Authorization")  # ✅ Obtener el token del request

    response = requests.delete(
        f"{URL_SEGURIDAD}/permisos/{id}",
        headers={"Authorization": auth_header}  # ✅ Enviar el token al backend
    )

    if response.status_code == 204:
        return {"mensaje": "Permiso eliminado correctamente"}

    raise HTTPException(status_code=response.status_code, detail="Error al eliminar permiso")

####################################### ✅ ESTADOS #######################################

@router.get("/seguridad/estados", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def obtener_estados(request: Request):
    """Obtiene todos los estados"""
    auth_header = request.headers.get("Authorization")

    response = requests.get(
        f"{URL_SEGURIDAD}/estados",
        headers={"Authorization": auth_header}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail="Error al obtener estados")


@router.get("/seguridad/estados/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def obtener_estado(id: str, request: Request):
    """Obtiene un estado por ID"""
    auth_header = request.headers.get("Authorization")

    response = requests.get(
        f"{URL_SEGURIDAD}/estados/{id}",
        headers={"Authorization": auth_header}  # ✅ Se envía el token de autorización
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail="Estado no encontrado")


@router.post("/seguridad/estados", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def crear_estado(request: Request):
    """Crea un nuevo estado en el sistema de seguridad."""
    datos = await request.json()
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.post(f"{URL_SEGURIDAD}/estados", json=datos, headers={"Authorization": auth_header, "Content-Type": "application/json"})

    if response.status_code in [200, 201]:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail=f"Error al crear estado: {response.text}")

@router.put("/seguridad/estados/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def actualizar_estado(id: str, request: Request):
    """Actualiza un estado en el sistema de seguridad."""
    datos = await request.json()
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.put(f"{URL_SEGURIDAD}/estados/{id}", json=datos, headers={"Authorization": auth_header, "Content-Type": "application/json"})

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail=f"Error al actualizar estado: {response.text}")


@router.delete("/seguridad/estados/{id}", dependencies=[Depends(verificar_rol("ADMIN"))])
async def eliminar_estado(id: str, request: Request):
    """Elimina un estado en el sistema de seguridad."""
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.delete(f"{URL_SEGURIDAD}/estados/{id}", headers={"Authorization": auth_header})

    if response.status_code == 204:
        return {"mensaje": "Estado eliminado correctamente"}

    raise HTTPException(status_code=response.status_code, detail=f"Error al eliminar estado: {response.text}")


