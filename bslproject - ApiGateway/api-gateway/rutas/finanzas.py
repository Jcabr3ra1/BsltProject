import requests
from fastapi import APIRouter, Depends, HTTPException, Request
from middleware.autenticacion import verificar_token, verificar_rol,verificar_roles_permitidos
import json


# Cargar configuración
with open("configuracion/config.json", "r") as archivo_config:
    configuracion = json.load(archivo_config)

URL_SEGURIDAD = configuracion["servicios"]["seguridad"]
URL_FINANZAS = configuracion["servicios"]["finanzas"]

router = APIRouter()

####################################### ✅ BOLSILLOS #######################################

@router.get("/finanzas/bolsillos", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_bolsillos(request: Request):
    """Obtiene todos los bolsillos en el sistema financiero."""
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.get(
        f"{URL_FINANZAS}/bolsillos",
        headers={"Authorization": auth_header}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail=f"Error al obtener bolsillos: {response.text}")

@router.post("/finanzas/bolsillos", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def crear_bolsillo(request: Request):
    """Crea un nuevo bolsillo en el sistema de finanzas."""
    data = await request.json()
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.post(
        f"{URL_FINANZAS}/bolsillos",
        json=data,
        headers={"Authorization": auth_header, "Content-Type": "application/json"}
    )

    print(f"🔍 Respuesta del backend Finanzas: {response.status_code} - {response.text}")  # 🔥 Debug

    if response.status_code in [200, 201]:
        result = response.json()
        if not result:  # Si está vacío, forzar la recuperación del bolsillo
            return {"mensaje": "Bolsillo creado, pero sin respuesta. Verifica en la base de datos."}
        return result

    raise HTTPException(status_code=response.status_code, detail=f"Error al crear bolsillo: {response.text}")

@router.get("/finanzas/bolsillos/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_bolsillo(id: str, request: Request):
    """Obtiene un bolsillo por su ID."""
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    print(f"🔍 Solicitando bolsillo con ID: {id}")  # 🔥 Debug

    response = requests.get(
        f"{URL_FINANZAS}/bolsillos/{id}",
        headers={"Authorization": auth_header}
    )

    print(f"🔍 Respuesta del backend: {response.status_code} - {response.text}")  # 🔥 Debug

    if response.status_code == 200:
        return response.json()

    if response.status_code == 404:
        error_data = response.json()
        raise HTTPException(status_code=404, detail=error_data.get("error", "Bolsillo no encontrado"))

    raise HTTPException(status_code=response.status_code, detail=f"Error al obtener bolsillo: {response.text}")

@router.put("/finanzas/bolsillos/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def actualizar_bolsillo(id: str, request: Request):
    """Actualiza un bolsillo en el sistema financiero."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.put(
        f"{URL_FINANZAS}/bolsillos/{id}",
        json=await request.json(),
        headers={"Authorization": auth_header, "Content-Type": "application/json"}
    )

    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al actualizar bolsillo"))

@router.delete("/finanzas/bolsillos/{id}", dependencies=[Depends(verificar_rol("ADMIN"))])
async def eliminar_bolsillo(id: str, request: Request):
    """Elimina un bolsillo en el sistema financiero."""
    response = requests.delete(
        f"{URL_FINANZAS}/bolsillos/{id}",
        headers={"Authorization": request.headers.get("Authorization")}
    )

    if response.status_code in [200, 204]:  # ✅ Aceptamos 200 y 204 como exitosos
        return {"mensaje": "Bolsillo eliminado correctamente"}

    raise HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al eliminar bolsillo"))

@router.put("/finanzas/bolsillos/{id_bolsillo}/cuenta/{id_cuenta}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def asignar_cuenta_a_bolsillo(id_bolsillo: str, id_cuenta: str, request: Request):
    """Asigna una cuenta a un bolsillo en el sistema financiero."""
    response = requests.put(
        f"{URL_FINANZAS}/bolsillos/{id_bolsillo}/cuenta/{id_cuenta}",
        headers={"Authorization": request.headers.get("Authorization")}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al asignar cuenta"))

####################################### CUENTAS #######################################
@router.post("/finanzas/cuentas", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def crear_cuenta(request: Request, token: str = Depends(verificar_token)):
    """Crea una nueva cuenta en el sistema financiero."""
    response = requests.post(
        f"{URL_FINANZAS}/cuentas",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token}"}
    )

    result = response.json()

    if response.status_code in [200, 201]:  # ✅ Aceptamos 200 y 201 como éxito
        if "error" in result:  # ❌ Si el backend manda error dentro del JSON
            raise HTTPException(status_code=400, detail=result["error"])
        return result  # ✅ Devolver la cuenta creada correctamente

    raise HTTPException(status_code=response.status_code, detail=result.get("error", "Error al crear cuenta"))


@router.get("/finanzas/cuentas", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_cuentas(token: str = Depends(verificar_token)):
    """Obtiene todas las cuentas en el sistema financiero."""
    response = requests.get(
        f"{URL_FINANZAS}/cuentas",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al obtener cuentas"))


@router.get("/finanzas/cuentas/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_cuenta(id: str, token: str = Depends(verificar_token)):
    """Obtiene una cuenta por su ID en el sistema financiero."""
    response = requests.get(
        f"{URL_FINANZAS}/cuentas/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Cuenta no encontrada"))


@router.put("/finanzas/cuentas/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def actualizar_cuenta(id: str, request: Request, token: str = Depends(verificar_token)):
    """Actualiza una cuenta en el sistema financiero."""
    response = requests.put(
        f"{URL_FINANZAS}/cuentas/{id}",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al actualizar cuenta"))


@router.delete("/finanzas/cuentas/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def eliminar_cuenta(id: str, token: str = Depends(verificar_token)):
    """Elimina una cuenta en el sistema financiero."""
    response = requests.delete(
        f"{URL_FINANZAS}/cuentas/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    return {"mensaje": "Cuenta eliminada correctamente"} if response.status_code in [200, 204] else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al eliminar cuenta"))


@router.put("/finanzas/cuentas/{id}/saldo")
async def actualizar_saldo_cuenta(id: str, request: Request, token: str = Depends(verificar_token)):
    """Actualiza el saldo de una cuenta"""
    headers = {"Authorization": f"Bearer {token}"}
    data = await request.json()
    response = requests.put(f"{URL_FINANZAS}/cuentas/{id}/saldo", json=data, headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)


@router.put("/finanzas/cuentas/{id_cuenta}/asignar-usuario/{id_usuario}")
async def asignar_cuenta_a_usuario(id_cuenta: str, id_usuario: str, request: Request):
    """Asigna una cuenta a un usuario en el sistema financiero a través del API Gateway."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    print(f"📌 Recibida solicitud para asignar cuenta {id_cuenta} al usuario {id_usuario}")

    # ✅ 1. Verificar si el usuario existe en Seguridad
    seguridad_url = f"{URL_SEGURIDAD}/usuarios/{id_usuario}"
    print(f"🔍 Verificando usuario en Seguridad: {seguridad_url}")

    response_usuario = requests.get(seguridad_url, headers={"Authorization": auth_header})

    if response_usuario.status_code != 200:
        print(f"❌ Usuario no encontrado en Seguridad: {response_usuario.status_code}")
        raise HTTPException(status_code=404, detail="Usuario no encontrado en Seguridad")

    print("✅ Usuario encontrado en Seguridad, procediendo a Finanzas")

    # ✅ 2. Llamar a Finanzas para asignar el usuario a la cuenta
    finanzas_url = f"{URL_FINANZAS}/cuentas/{id_cuenta}/asignar-usuario/{id_usuario}"
    print(f"🔄 Llamando a Finanzas: {finanzas_url}")

    try:
        response = requests.put(finanzas_url, headers={"Authorization": auth_header}, timeout=10)
        response.raise_for_status()  # ✅ Lanza una excepción si hay un error
    except requests.exceptions.RequestException as e:
        print(f"❌ Error al llamar a Finanzas: {e}")
        raise HTTPException(status_code=500, detail=f"Error al asignar usuario en Finanzas: {str(e)}")

    print("✅ Asignación completada con éxito")
    return response.json()


####################################### ✅ TRANSACCIONES #######################################

@router.get("/finanzas/transacciones", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_transacciones(token: str = Depends(verificar_token)):
    """Obtiene todas las transacciones"""
    response = requests.get(
        f"{URL_FINANZAS}/transacciones",
        headers={"Authorization": f"Bearer {token}"}
    )

    print("📩 Respuesta del servidor:", response.status_code, response.text)  # 🐞 Depuración

    if response.status_code == 200:
        return response.json()

    error_message = response.json().get("error", "Error al obtener transacciones")
    raise HTTPException(status_code=response.status_code, detail=error_message)


@router.get("/finanzas/transacciones/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_transaccion(id: str, token: str = Depends(verificar_token)):
    """Obtiene una transacción por su ID"""
    response = requests.get(
        f"{URL_FINANZAS}/transacciones/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )

    print("📩 Respuesta del servidor:", response.status_code, response.text)  # 🐞 Depuración

    if response.status_code == 200:
        return response.json()

    error_message = response.json().get("error", "Error al obtener transacción")
    raise HTTPException(status_code=response.status_code, detail=error_message)


@router.post("/finanzas/transacciones", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def crear_transaccion(request: Request, token: str = Depends(verificar_token)):
    """Crea una nueva transacción"""
    data = await request.json()
    print("🔎 Enviando datos para crear transacción:", data)  # 🐞 Depuración

    response = requests.post(
        f"{URL_FINANZAS}/transacciones",
        json=data,
        headers={"Authorization": f"Bearer {token}"}
    )

    print("📩 Respuesta del servidor:", response.status_code, response.text)  # 🐞 Depuración

    if response.status_code in [200, 201]:  # ✅ Permitir 200 y 201 como respuestas exitosas
        return response.json()

    error_message = response.json().get("error", "Error al crear transacción")
    print(f"❌ Error al crear transacción: {error_message}")  # 🐞 Depuración
    raise HTTPException(status_code=response.status_code, detail=error_message)


@router.put("/finanzas/transacciones/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN"]))])
async def actualizar_transaccion(id: str, request: Request, token: str = Depends(verificar_token)):
    """Actualiza solo ciertos campos de una transacción"""
    data = await request.json()

    # Se permiten modificar solo estos campos
    campos_permitidos = ["descripcion", "fecha_transaccion"]

    # Filtrar solo los campos permitidos
    data_actualizada = {campo: data[campo] for campo in campos_permitidos if campo in data}

    response = requests.put(
        f"{URL_FINANZAS}/transacciones/{id}",
        json=data_actualizada,
        headers={"Authorization": f"Bearer {token}"}
    )

    return response.json() if response.status_code == 200 else HTTPException(
        status_code=response.status_code,
        detail=response.json().get("error", "Error al actualizar transacción")
    )


@router.put("/finanzas/transacciones/{id}/anular", dependencies=[Depends(verificar_roles_permitidos(["ADMIN"]))])
async def anular_transaccion(id: str, token: str = Depends(verificar_token)):
    """Anula una transacción en lugar de eliminarla"""

    response = requests.put(
        f"{URL_FINANZAS}/transacciones/{id}/anular",  # ✅ Correcto: Se usa PUT en la URL correcta
        headers={"Authorization": f"Bearer {token}"}
    )

    if response.status_code == 200:
        return {"mensaje": "Transacción anulada correctamente"}

    return HTTPException(
        status_code=response.status_code,
        detail=response.json().get("error", "Error al anular transacción")
    )

####################################### ✅ TIPO MOVIMIENTO #######################################

@router.get("/finanzas/tipo_movimiento", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_tipo_movimientos(token: str = Depends(verificar_token)):
    """Obtiene todos los tipos de movimiento"""
    response = requests.get(
        f"{URL_FINANZAS}/tipo_movimiento",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al obtener tipos de movimiento"))

from fastapi import HTTPException


@router.post("/finanzas/tipo_transaccion", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def crear_tipo_transaccion(request: Request, token: str = Depends(verificar_token)):
    """Crea un nuevo tipo de transacción"""
    data = await request.json()
    response = requests.post(
        f"{URL_FINANZAS}/tipo_transaccion",
        json=data,
        headers={"Authorization": f"Bearer {token}"}
    )
    print("📢 Respuesta Finanzas:", response.status_code, response.text)  # Debug 🔥
    return response.json() if response.status_code in [200, 201] else HTTPException(status_code=response.status_code, detail="Error al crear tipo de transacción")

@router.get("/finanzas/tipo_movimiento/{id}",
            dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_tipo_movimiento(id: str, token: str = Depends(verificar_token)):
    """Obtiene un tipo de movimiento por su ID"""

    response = requests.get(
        f"{URL_FINANZAS}/tipo_movimiento/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )

    # 🔥 Debug: Verificar la respuesta del backend Finanzas
    print(f"📢 Status Code recibido de Finanzas: {response.status_code}")

    try:
        respuesta_json = response.json()
        print(f"📢 Respuesta JSON de Finanzas: {respuesta_json}")  # Debug
    except Exception:
        return HTTPException(status_code=500, detail="Error en la respuesta del servidor Finanzas (no es JSON válido)")

    # ✅ Verificar si Finanzas devolvió una respuesta válida
    if response.status_code == 200:
        return respuesta_json
    elif response.status_code == 404:
        return HTTPException(status_code=404, detail="Tipo de movimiento no encontrado en Finanzas")
    else:
        return HTTPException(status_code=response.status_code, detail="Error al obtener tipo de movimiento")


@router.put("/finanzas/tipo_movimiento/{id}",
            dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def actualizar_tipo_movimiento(id: str, request: Request, token: str = Depends(verificar_token)):
    """Actualiza un tipo de movimiento por su ID"""

    data = await request.json()

    response = requests.put(
        f"{URL_FINANZAS}/tipo_movimiento/{id}",
        json=data,
        headers={"Authorization": f"Bearer {token}"}
    )

    # 🔥 Debug: Verificar la respuesta del backend Finanzas
    print(f"📢 Status Code recibido de Finanzas: {response.status_code}")

    try:
        respuesta_json = response.json()
        print(f"📢 Respuesta JSON de Finanzas: {respuesta_json}")  # Debug
    except Exception:
        return HTTPException(status_code=500, detail="Error en la respuesta del servidor Finanzas (no es JSON válido)")

    # ✅ Verificar si Finanzas devolvió una respuesta válida
    if response.status_code == 200:
        return respuesta_json
    elif response.status_code == 404:
        return HTTPException(status_code=404, detail="Tipo de movimiento no encontrado en Finanzas")
    else:
        return HTTPException(status_code=response.status_code, detail="Error al actualizar tipo de movimiento")


@router.delete("/finanzas/tipo_movimiento/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN"]))])
async def eliminar_tipo_movimiento(id: str, token: str = Depends(verificar_token)):
    """Elimina un tipo de movimiento por su ID"""

    response = requests.delete(
        f"{URL_FINANZAS}/tipo_movimiento/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )

    # 🔥 Debug: Verificar la respuesta del backend Finanzas
    print(f"📢 Status Code recibido de Finanzas: {response.status_code}")

    # ✅ Verificar si Finanzas devolvió una respuesta válida
    if response.status_code == 200:
        return {"mensaje": "Tipo de movimiento eliminado correctamente"}
    elif response.status_code == 404:
        return HTTPException(status_code=404, detail="Tipo de movimiento no encontrado en Finanzas")
    else:
        return HTTPException(status_code=response.status_code, detail="Error al eliminar tipo de movimiento")

####################################### ✅ TIPO TRANSACCIÓN #######################################

@router.get("/finanzas/tipo_transaccion", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_tipo_transacciones(token: str = Depends(verificar_token)):
    """Obtiene todos los tipos de transacción"""
    response = requests.get(
        f"{URL_FINANZAS}/tipo_transaccion",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al obtener tipos de transacción"))

@router.post("/finanzas/tipo_transaccion", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def crear_tipo_transaccion(request: Request, token: str = Depends(verificar_token)):
    """Crea un nuevo tipo de transacción"""
    data = await request.json()
    response = requests.post(
        f"{URL_FINANZAS}/tipo_transaccion",
        json=data,
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 201 else HTTPException(status_code=response.status_code, detail="Error al crear tipo de transacción")

@router.get("/finanzas/tipo_transaccion/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_tipo_transaccion(id: str, token: str = Depends(verificar_token)):
    """Obtiene un tipo de transacción por su ID"""
    response = requests.get(
        f"{URL_FINANZAS}/tipo_transaccion/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Tipo de transacción no encontrado")

@router.put("/finanzas/tipo_transaccion/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def actualizar_tipo_transaccion(id: str, request: Request, token: str = Depends(verificar_token)):
    """Actualiza un tipo de transacción"""
    data = await request.json()
    response = requests.put(
        f"{URL_FINANZAS}/tipo_transaccion/{id}",
        json=data,
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al actualizar tipo de transacción")

@router.delete("/finanzas/tipo_transaccion/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN"]))])
async def eliminar_tipo_transaccion(id: str, token: str = Depends(verificar_token)):
    """Elimina un tipo de transacción"""
    response = requests.delete(
        f"{URL_FINANZAS}/tipo_transaccion/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )

    if response.status_code == 200:  # ✅ No Content - Eliminado correctamente
        return {"mensaje": "Tipo de transacción eliminado correctamente"}

    elif response.status_code == 404:  # ❌ No encontrado
        return HTTPException(status_code=404, detail="Tipo de transacción no encontrado")

    else:  # ❌ Otro error
        return HTTPException(status_code=response.status_code, detail=f"Error al eliminar tipo de transacción: {response.text}")


