import requests
from fastapi import APIRouter, Depends, HTTPException, Request
from middleware.autenticacion import verificar_token, verificar_rol, verificar_roles_permitidos
import json
from typing import Dict, Any

# Cargar configuración
with open("configuracion/config.json", "r") as archivo_config:
    configuracion = json.load(archivo_config)

URL_SEGURIDAD = configuracion["servicios"]["seguridad"]
URL_FINANZAS = configuracion["servicios"]["finanzas"]

router = APIRouter(prefix="/finanzas")

####################################### BOLSILLOS #######################################

@router.get("/bolsillos", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_bolsillos(request: Request):
    """Obtiene todos los bolsillos en el sistema financiero."""
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.get(
        f"{URL_FINANZAS}/finanzas/bolsillos",
        headers={"Authorization": auth_header}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail=f"Error al obtener bolsillos: {response.text}")

@router.post("/bolsillos", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def crear_bolsillo(request: Request):
    """Crea un nuevo bolsillo en el sistema de finanzas."""
    data = await request.json()
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.post(
        f"{URL_FINANZAS}/finanzas/bolsillos",
        json=data,
        headers={"Authorization": auth_header, "Content-Type": "application/json"}
    )

    if response.status_code in [200, 201]:
        result = response.json()
        if not result:  
            return {"mensaje": "Bolsillo creado, pero sin respuesta. Verifica en la base de datos."}
        return result

    raise HTTPException(status_code=response.status_code, detail=f"Error al crear bolsillo: {response.text}")

@router.get("/bolsillos/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_bolsillo(id: str, request: Request):
    """Obtiene un bolsillo por su ID."""
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.get(
        f"{URL_FINANZAS}/finanzas/bolsillos/{id}",
        headers={"Authorization": auth_header}
    )

    if response.status_code == 200:
        return response.json()

    if response.status_code == 404:
        error_data = response.json()
        raise HTTPException(status_code=404, detail=error_data.get("error", "Bolsillo no encontrado"))

    raise HTTPException(status_code=response.status_code, detail=f"Error al obtener bolsillo: {response.text}")

@router.put("/bolsillos/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def actualizar_bolsillo(id: str, request: Request):
    """Actualiza un bolsillo en el sistema financiero."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.put(
        f"{URL_FINANZAS}/finanzas/bolsillos/{id}",
        json=await request.json(),
        headers={"Authorization": auth_header, "Content-Type": "application/json"}
    )

    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al actualizar bolsillo"))

@router.delete("/bolsillos/{id}", dependencies=[Depends(verificar_rol("ADMIN"))])
async def eliminar_bolsillo(id: str, request: Request):
    """Elimina un bolsillo en el sistema financiero."""
    response = requests.delete(
        f"{URL_FINANZAS}/finanzas/bolsillos/{id}",
        headers={"Authorization": request.headers.get("Authorization")}
    )

    if response.status_code == 200:
        return {"mensaje": "Bolsillo eliminado correctamente"}
    else:
        return HTTPException(status_code=response.status_code, detail=f"Error al eliminar bolsillo: {response.text}")

@router.put("/bolsillos/{id_bolsillo}/cuentas/{id_cuenta}")
async def asignar_cuenta_a_bolsillo(id_bolsillo: str, id_cuenta: str, request: Request):
    """Asigna una cuenta a un bolsillo en el sistema financiero."""
    response = requests.put(
        f"{URL_FINANZAS}/finanzas/bolsillos/{id_bolsillo}/cuentas/{id_cuenta}",
        headers={"Authorization": request.headers.get("Authorization")}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=f"Error al asignar cuenta a bolsillo: {response.text}")

@router.delete("/bolsillos/{id}/desasociar", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def eliminar_bolsillo_y_quitar_referencia(id: str, request: Request):
    """Elimina un bolsillo y desasocia la cuenta si estaba asociada."""
    response = requests.delete(
        f"{URL_FINANZAS}/finanzas/bolsillos/{id}/desasociar",
        headers={"Authorization": request.headers.get("Authorization")}
    )
    if response.status_code == 200:
        return {"mensaje": "Bolsillo eliminado y cuenta desasociada"}
    raise HTTPException(status_code=response.status_code, detail=f"Error al eliminar bolsillo: {response.text}")


####################################### CUENTAS #######################################
@router.post("/cuentas", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def crear_cuenta(request: Request):
    """Crea una nueva cuenta en el sistema financiero."""
    data = await request.json()
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.post(
        f"{URL_FINANZAS}/finanzas/cuentas",
        json=data,
        headers={"Authorization": auth_header, "Content-Type": "application/json"}
    )

    if response.status_code in [200, 201]:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail=f"Error al crear cuenta: {response.text}")

@router.get("/cuentas", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_cuentas(request: Request):
    """Obtiene todas las cuentas en el sistema financiero."""
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.get(
        f"{URL_FINANZAS}/finanzas/cuentas",
        headers={"Authorization": auth_header}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail=f"Error al obtener cuentas: {response.text}")

@router.get("/cuentas/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_cuenta(id: str, request: Request):
    """Obtiene una cuenta por su ID."""
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.get(
        f"{URL_FINANZAS}/finanzas/cuentas/{id}",
        headers={"Authorization": auth_header}
    )

    if response.status_code == 200:
        return response.json()

    if response.status_code == 404:
        error_data = response.json()
        raise HTTPException(status_code=404, detail=error_data.get("error", "Cuenta no encontrada"))

    raise HTTPException(status_code=response.status_code, detail=f"Error al obtener cuenta: {response.text}")

@router.put("/cuentas/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def actualizar_cuenta(id: str, request: Request):
    """Actualiza una cuenta en el sistema financiero."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.put(
        f"{URL_FINANZAS}/finanzas/cuentas/{id}",
        json=await request.json(),
        headers={"Authorization": auth_header, "Content-Type": "application/json"}
    )

    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al actualizar cuenta"))

@router.delete("/cuentas/{id}", dependencies=[Depends(verificar_rol("ADMIN"))])
async def eliminar_cuenta(id: str, request: Request):
    """Elimina una cuenta en el sistema financiero."""
    response = requests.delete(
        f"{URL_FINANZAS}/finanzas/cuentas/{id}",
        headers={"Authorization": request.headers.get("Authorization")}
    )

    if response.status_code in [200, 204]:
        return {"mensaje": "Cuenta eliminada correctamente"}
    else:
        # Cambiado de return a raise
        raise HTTPException(status_code=response.status_code, detail=f"Error al eliminar cuenta: {response.text}")

@router.get("/cuentas/usuario/{id_usuario}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_cuentas_por_usuario(id_usuario: str, request: Request):
    """Obtiene las cuentas asociadas a un usuario."""
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    print(f"API Gateway: Solicitando cuentas para el usuario: {id_usuario}")
    
    response = requests.get(
        f"{URL_FINANZAS}/finanzas/cuentas/usuario/{id_usuario}",
        headers={"Authorization": auth_header}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(
        status_code=response.status_code, 
        detail=f"Error al obtener cuentas del usuario: {response.text}"
    )

@router.put("/cuentas/{id}/usuario/{id_usuario}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def asignar_usuario_a_cuenta(id: str, id_usuario: str, request: Request):
    """Asigna un usuario a una cuenta en el sistema financiero."""
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    # Imprimir información de depuración
    print(f"Asignando usuario {id_usuario} a cuenta {id}")
    print(f"URL de destino: {URL_FINANZAS}/finanzas/cuentas/{id}/usuario/{id_usuario}")

    response = requests.put(
        f"{URL_FINANZAS}/finanzas/cuentas/{id}/usuario/{id_usuario}",
        headers={"Authorization": auth_header}
    )

    # Imprimir respuesta para depuración
    print(f"Respuesta del servicio financiero: {response.status_code} - {response.text}")

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail=f"Error al asignar usuario a cuenta: {response.text}")


@router.put("/usuarios/{userId}/cuentas/desasociar/{cuentaId}")
async def desasociar_cuenta_de_usuario(userId: str, cuentaId: str, request: Request):
    """Desasocia la cuenta del usuario"""
    auth_header = request.headers.get("Authorization")

    response = requests.put(
        f"{URL_SEGURIDAD}/seguridad/usuarios/{userId}/cuentas/desasociar/{cuentaId}",
        headers={"Authorization": auth_header}
    )

    if response.status_code in [200, 204]:
        return response.json() if response.text else {"mensaje": "Cuenta desasociada del usuario"}

    raise HTTPException(
        status_code=response.status_code,
        detail=f"Error al desasociar cuenta del usuario: {response.text}"
    )

####################################### TRANSACCIONES - CRUD GENERAL #######################################

@router.get("/transacciones", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_transacciones(token_info: Dict[str, Any] = Depends(verificar_token)):
    """Obtiene todas las transacciones."""
    response = requests.get(
        f"{URL_FINANZAS}/finanzas/transacciones",
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al obtener transacciones")

@router.get("/transacciones/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_transaccion(id: str, token_info: Dict[str, Any] = Depends(verificar_token)):
    """Obtiene una transacción por su ID."""
    response = requests.get(
        f"{URL_FINANZAS}/finanzas/transacciones/{id}",
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Transacción no encontrada")

@router.post("/transacciones", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def crear_transaccion(request: Request, token_info: Dict[str, Any] = Depends(verificar_token)):
    """Crea una nueva transacción."""
    response = requests.post(
        f"{URL_FINANZAS}/finanzas/transacciones",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al crear transacción")

@router.put("/transacciones/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def actualizar_transaccion(id: str, request: Request, token_info: Dict[str, Any] = Depends(verificar_token)):
    """Actualiza una transacción existente."""
    response = requests.put(
        f"{URL_FINANZAS}/finanzas/transacciones/{id}",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al actualizar transacción")

@router.put("/transacciones/{id}/anular", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def anular_transaccion(id: str, token_info: Dict[str, Any] = Depends(verificar_token)):
    """Anula una transacción."""
    response = requests.put(
        f"{URL_FINANZAS}/finanzas/transacciones/{id}/anular",
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al anular transacción")

@router.put("/transacciones/{id}/aprobar", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def aprobar_transaccion(id: str, token_info: Dict[str, Any] = Depends(verificar_token)):
    """Aprueba una transacción pendiente."""
    response = requests.put(
        f"{URL_FINANZAS}/finanzas/transacciones/{id}/aprobar",
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al aprobar transacción")

@router.get("/transacciones/historial", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def historial_transacciones(
    token_info: Dict[str, Any] = Depends(verificar_token),
    fechaInicio: str = None,
    fechaFin: str = None,
    tipo: str = None
):
    """Obtiene el historial de transacciones con filtros opcionales."""
    params = {}
    if fechaInicio: params["fechaInicio"] = fechaInicio
    if fechaFin: params["fechaFin"] = fechaFin
    if tipo: params["tipo"] = tipo

    response = requests.get(
        f"{URL_FINANZAS}/finanzas/transacciones/historial",
        params=params,
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al obtener historial")

####################################### TRANSACCIONES - CONSULTAS POR USUARIO #######################################

@router.get("/transacciones/usuario/{id_usuario}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_transacciones_por_usuario(id_usuario: str, token_info: Dict[str, Any] = Depends(verificar_token)):
    """Obtiene todas las transacciones asociadas a un usuario."""
    response = requests.get(
        f"{URL_FINANZAS}/finanzas/transacciones/usuario/{id_usuario}",
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al obtener transacciones del usuario")

@router.get("/transacciones/usuario/{id_usuario}/proximos-pagos", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_proximos_pagos(id_usuario: str, token_info: Dict[str, Any] = Depends(verificar_token)):
    """Obtiene los próximos pagos programados para un usuario."""
    response = requests.get(
        f"{URL_FINANZAS}/finanzas/transacciones/usuario/{id_usuario}/proximos-pagos",
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al obtener próximos pagos del usuario")

####################################### TRANSACCIONES - OPERACIONES ESPECÍFICAS #######################################

# ---------------------------- TRANSFERENCIAS ----------------------------

@router.post("/transferencias/cuenta-cuenta", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def transferencia_cuenta_cuenta(request: Request, token_info: Dict[str, Any] = Depends(verificar_token)):
    """Transferencia de cuenta a cuenta."""
    data = await request.json()

    # ✔ Validar que los campos requeridos estén presentes
    required_fields = ["id_cuenta_origen", "id_cuenta_destino", "id_tipo_movimiento", "monto"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Campos faltantes en la solicitud: {', '.join(missing)}"
        )

    # 📦 Opcional: imprimir para depurar
    print("📨 JSON recibido:", data)

    # 🧱 Construcción del payload esperado por el backend financiero
    payload_backend = {
        "cuentaOrigenId": data["id_cuenta_origen"],
        "cuentaDestinoId": data["id_cuenta_destino"],
        "tipoMovimientoId": data["id_tipo_movimiento"],
        "tipoTransaccionId": data.get("id_tipo_transaccion"),
        "descripcion": data.get("descripcion", "Transferencia entre cuentas"),
        "monto": data["monto"],
        "uuid_transaccion": data.get("uuid_transaccion")
    }

    # 🚀 Enviar al backend financiero
    response = requests.post(
        f"{URL_FINANZAS}/finanzas/transacciones/cuenta-cuenta",
        json=payload_backend,
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(
        status_code=response.status_code,
        detail=f"Error en la transferencia cuenta-cuenta: {response.text}"
    )


@router.post("/transferencias/cuenta-bolsillo", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def transferencia_cuenta_bolsillo(request: Request, token_info: Dict[str, Any] = Depends(verificar_token)):
    """Transferencia de cuenta a bolsillo."""
    data = await request.json()

    # ✔ Validar campos requeridos
    required_fields = ["id_cuenta_origen", "id_bolsillo_destino", "id_tipo_movimiento", "monto"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Campos faltantes en la solicitud: {', '.join(missing)}"
        )

    # 🧾 Log opcional para depurar
    print("📨 JSON recibido:", data)

    # 🧱 Construir payload para backend financiero
    payload_backend = {
        "cuentaOrigenId": data["id_cuenta_origen"],
        "bolsilloDestinoId": data["id_bolsillo_destino"],
        "tipoMovimientoId": data["id_tipo_movimiento"],
        "tipoTransaccionId": data.get("id_tipo_transaccion"),
        "uuid_transaccion": data.get("uuid_transaccion"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Transferencia de cuenta a bolsillo")
    }

    # 🚀 Llamada al backend financiero
    response = requests.post(
        f"{URL_FINANZAS}/finanzas/transacciones/cuenta-bolsillo",
        json=payload_backend,
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(
        status_code=response.status_code,
        detail=f"Error en la transferencia cuenta-bolsillo: {response.text}"
    )




@router.post("/transferencias/bolsillo-cuenta", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def transferencia_bolsillo_cuenta(request: Request, token_info: Dict[str, Any] = Depends(verificar_token)):
    """Transferencia de bolsillo a cuenta."""
    data = await request.json()

    # ✔ Validación de campos requeridos
    required_fields = ["id_bolsillo_origen", "id_cuenta_destino", "id_tipo_movimiento", "monto"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Campos faltantes en la solicitud: {', '.join(missing)}"
        )

    # 🧾 Log opcional para depuración
    print("📨 JSON recibido:", data)

    # 🧱 Payload esperado por el backend financiero
    payload_backend = {
        "bolsilloOrigenId": data["id_bolsillo_origen"],
        "cuentaDestinoId": data["id_cuenta_destino"],
        "tipoMovimientoId": data["id_tipo_movimiento"],
        "tipoTransaccionId": data.get("id_tipo_transaccion"),
        "uuid_transaccion": data.get("uuid_transaccion"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Transferencia de bolsillo a cuenta")
    }

    # 🚀 Envío al backend financiero
    response = requests.post(
        f"{URL_FINANZAS}/finanzas/transacciones/bolsillo-cuenta",
        json=payload_backend,
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(
        status_code=response.status_code,
        detail=f"Error en la transferencia bolsillo-cuenta: {response.text}"
    )



@router.post("/transferencias/bolsillo-bolsillo", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def transferencia_bolsillo_bolsillo(request: Request, token_info: Dict[str, Any] = Depends(verificar_token)):
    """Transferencia de bolsillo a bolsillo."""
    data = await request.json()

    # ✔ Validación de campos requeridos
    required_fields = ["id_bolsillo_origen", "id_bolsillo_destino", "id_tipo_movimiento", "monto"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Campos faltantes en la solicitud: {', '.join(missing)}"
        )

    # 🧾 Log para depuración
    print("📨 JSON recibido:", data)

    # 🧱 Construcción del payload para el backend financiero
    payload_backend = {
        "bolsilloOrigenId": data["id_bolsillo_origen"],
        "bolsilloDestinoId": data["id_bolsillo_destino"],
        "tipoMovimientoId": data["id_tipo_movimiento"],
        "tipoTransaccionId": data.get("id_tipo_transaccion"),
        "uuid_transaccion": data.get("uuid_transaccion"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Transferencia entre bolsillos")
    }

    # 🚀 Envío al backend financiero
    response = requests.post(
        f"{URL_FINANZAS}/finanzas/transacciones/bolsillo-bolsillo",
        json=payload_backend,
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(
        status_code=response.status_code,
        detail=f"Error en la transferencia bolsillo-bolsillo: {response.text}"
    )


# ---------------------------- CONSIGNACIONES ----------------------------

@router.post("/consignaciones/banco-cuenta", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def consignacion_banco_cuenta(request: Request, token_info: Dict[str, Any] = Depends(verificar_token)):
    """Consignación desde banco hacia cuenta."""
    data = await request.json()

    # ✔ Validar campos requeridos
    required_fields = ["id_cuenta_destino", "id_tipo_movimiento", "monto"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Campos faltantes en la solicitud: {', '.join(missing)}"
        )

    # 🧾 Log para depuración
    print("📨 JSON recibido:", data)

    # 🧱 Payload para el backend financiero
    payload_backend = {
        "cuentaDestinoId": data["id_cuenta_destino"],
        "tipoMovimientoId": data["id_tipo_movimiento"],
        "tipoTransaccionId": data.get("id_tipo_transaccion"),
        "uuid_transaccion": data.get("uuid_transaccion"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Consignación de banco a cuenta")
    }

    # 🚀 Enviar al backend financiero
    response = requests.post(
        f"{URL_FINANZAS}/finanzas/transacciones/banco-cuenta",
        json=payload_backend,
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(
        status_code=response.status_code,
        detail=f"Error en la consignación banco-cuenta: {response.text}"
    )

@router.post("/consignaciones/banco-bolsillo", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def consignacion_banco_bolsillo(request: Request, token_info: Dict[str, Any] = Depends(verificar_token)):
    """Consignación desde banco hacia bolsillo."""
    data = await request.json()

    # ✔ Validar campos requeridos
    required_fields = ["id_bolsillo_destino", "id_tipo_movimiento", "monto"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Campos faltantes en la solicitud: {', '.join(missing)}"
        )

    # 🧾 Log de depuración
    print("📨 JSON recibido:", data)

    # 🧱 Payload para el backend financiero
    payload_backend = {
        "bolsilloDestinoId": data["id_bolsillo_destino"],
        "tipoMovimientoId": data["id_tipo_movimiento"],
        "tipoTransaccionId": data.get("id_tipo_transaccion"),
        "uuid_transaccion": data.get("uuid_transaccion"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Consignación de banco a bolsillo")
    }

    # 🚀 Enviar al backend financiero
    response = requests.post(
        f"{URL_FINANZAS}/finanzas/transacciones/banco-bolsillo",
        json=payload_backend,
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(
        status_code=response.status_code,
        detail=f"Error en la consignación banco-bolsillo: {response.text}"
    )




# ---------------------------- RETIROS ----------------------------

@router.post("/retiros/cuenta-banco", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def retiro_cuenta_banco(request: Request, token_info: Dict[str, Any] = Depends(verificar_token)):
    """Retiro desde cuenta hacia banco."""
    data = await request.json()

    # ✔ Validar campos requeridos
    required_fields = ["id_cuenta_origen", "id_tipo_movimiento", "monto"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Campos faltantes en la solicitud: {', '.join(missing)}"
        )

    # 🧾 Log para depurar
    print("📨 JSON recibido:", data)

    # 🧱 Construir el payload para el backend financiero
    payload_backend = {
        "cuentaOrigenId": data["id_cuenta_origen"],
        "tipoMovimientoId": data["id_tipo_movimiento"],
        "tipoTransaccionId": data.get("id_tipo_transaccion"),
        "uuid_transaccion": data.get("uuid_transaccion"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Retiro de cuenta a banco")
    }

    # 🚀 Enviar solicitud al backend financiero
    response = requests.post(
        f"{URL_FINANZAS}/finanzas/transacciones/cuenta-banco",
        json=payload_backend,
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(
        status_code=response.status_code,
        detail=f"Error en el retiro cuenta-banco: {response.text}"
    )

@router.post("/retiros/bolsillo-cuenta", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def retiro_bolsillo_cuenta(request: Request, token_info: Dict[str, Any] = Depends(verificar_token)):
    """Retiro desde bolsillo hacia cuenta."""
    data = await request.json()

    # ✔ Verificación de campos requeridos
    required_fields = ["id_bolsillo_origen", "id_cuenta_destino", "id_tipo_movimiento", "monto"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Campos faltantes en la solicitud: {', '.join(missing)}"
        )

    # 📦 Construcción del payload para el backend financiero
    payload_backend = {
        "bolsilloOrigenId": data["id_bolsillo_origen"],
        "cuentaDestinoId": data["id_cuenta_destino"],
        "tipoMovimientoId": data["id_tipo_movimiento"],
        "tipoTransaccionId": data.get("id_tipo_transaccion"),
        "uuid_transaccion": data.get("uuid_transaccion"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Retiro de bolsillo a cuenta")
    }

    # 🚀 Enviar al backend financiero
    response = requests.post(
        f"{URL_FINANZAS}/finanzas/transacciones/bolsillo-cuenta",
        json=payload_backend,
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(
        status_code=response.status_code,
        detail=f"Error en el retiro bolsillo-cuenta: {response.text}"
    )

@router.post("/retiros/bolsillo-banco", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def retiro_bolsillo_banco(request: Request, token_info: Dict[str, Any] = Depends(verificar_token)):
    """Retiro desde un bolsillo hacia el banco."""
    data = await request.json()

    # ✔ Validar campos requeridos
    required_fields = ["id_bolsillo_origen", "id_tipo_movimiento", "monto"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Campos faltantes en la solicitud: {', '.join(missing)}"
        )

    # 📦 Construir el payload
    payload_backend = {
        "bolsilloOrigenId": data["id_bolsillo_origen"],
        "tipoMovimientoId": data["id_tipo_movimiento"],
        "tipoTransaccionId": data.get("id_tipo_transaccion"),
        "uuid_transaccion": data.get("uuid_transaccion"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Retiro de bolsillo a banco")
    }

    # 🚀 Enviar al backend financiero
    response = requests.post(
        f"{URL_FINANZAS}/finanzas/transacciones/bolsillo-banco",
        json=payload_backend,
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(
        status_code=response.status_code,
        detail=f"Error en el retiro bolsillo-banco: {response.text}"
    )

####################################### TIPO MOVIMIENTO #######################################
@router.get("/tipos-movimiento")
async def obtener_tipos_movimiento(request: Request):
    """Obtiene todos los tipos de movimiento."""
    auth_header = request.headers.get("Authorization")
    
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")
    
    response = requests.get(
        f"{URL_FINANZAS}/finanzas/tipos-movimiento",
        headers={"Authorization": auth_header}  # Enviar el header de autorización original
    )
    
    if response.status_code == 200:
        return response.json()
    
    raise HTTPException(status_code=response.status_code, detail=f"Error al obtener tipos de movimiento: {response.text}")

@router.post("/tipos-movimiento")
async def crear_tipo_movimiento(request: Request):
    """Crea un nuevo tipo de movimiento."""
    auth_header = request.headers.get("Authorization")
    
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")
    
    response = requests.post(
        f"{URL_FINANZAS}/finanzas/tipos-movimiento",
        json=await request.json(),
        headers={"Authorization": auth_header, "Content-Type": "application/json"}
    )
    
    if response.status_code in [200, 201]:
        return response.json()
    
    raise HTTPException(status_code=response.status_code, detail=f"Error al crear tipo de movimiento: {response.text}")

@router.get("/tipos-movimiento/{id}")
async def obtener_tipo_movimiento(id: str, request: Request):
    """Obtiene un tipo de movimiento por su ID."""
    auth_header = request.headers.get("Authorization")
    
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")
    
    response = requests.get(
        f"{URL_FINANZAS}/finanzas/tipos-movimiento/{id}",
        headers={"Authorization": auth_header}
    )
    
    if response.status_code == 200:
        return response.json()
    
    raise HTTPException(status_code=response.status_code, detail=f"Error al obtener tipo de movimiento: {response.text}")

@router.put("/tipos-movimiento/{id}")
async def actualizar_tipo_movimiento(id: str, request: Request):
    """Actualiza un tipo de movimiento."""
    auth_header = request.headers.get("Authorization")
    
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")
    
    response = requests.put(
        f"{URL_FINANZAS}/finanzas/tipos-movimiento/{id}",
        json=await request.json(),
        headers={"Authorization": auth_header, "Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        return response.json()
    
    raise HTTPException(status_code=response.status_code, detail=f"Error al actualizar tipo de movimiento: {response.text}")

@router.delete("/tipos-movimiento/{id}")
async def eliminar_tipo_movimiento(id: str, request: Request):
    """Elimina un tipo de movimiento."""
    auth_header = request.headers.get("Authorization")
    
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")
    
    response = requests.delete(
        f"{URL_FINANZAS}/finanzas/tipos-movimiento/{id}",
        headers={"Authorization": auth_header}
    )
    
    if response.status_code in [200, 204]:
        return {"mensaje": "Tipo de movimiento eliminado correctamente"}
    
    raise HTTPException(status_code=response.status_code, detail=f"Error al eliminar tipo de movimiento: {response.text}")

####################################### TIPO TRANSACCIÓN #######################################

@router.get("/tipos-transaccion", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_tipos_transaccion(token: str = Depends(verificar_token)):
    """Obtiene todos los tipos de transacción."""
    response = requests.get(
        f"{URL_FINANZAS}/finanzas/tipos-transaccion",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al obtener tipos de transacción"))

@router.post("/tipos-transaccion", dependencies=[Depends(verificar_roles_permitidos(["ADMIN"]))])
async def crear_tipo_transaccion(request: Request, token: str = Depends(verificar_token)):
    """Crea un nuevo tipo de transacción."""
    response = requests.post(
        f"{URL_FINANZAS}/finanzas/tipos-transaccion",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al crear tipo de transacción"))

@router.get("/tipos-transaccion/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_tipo_transaccion(id: str, token: str = Depends(verificar_token)):
    """Obtiene un tipo de transacción por su ID."""
    response = requests.get(
        f"{URL_FINANZAS}/finanzas/tipos-transaccion/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Tipo de transacción no encontrado"))

@router.put("/tipos-transaccion/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN"]))])
async def actualizar_tipo_transaccion(id: str, request: Request, token: str = Depends(verificar_token)):
    """Actualiza un tipo de transacción."""
    response = requests.put(
        f"{URL_FINANZAS}/finanzas/tipos-transaccion/{id}",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al actualizar tipo de transacción"))

@router.delete("/tipos-transaccion/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN"]))])
async def eliminar_tipo_transaccion(id: str, token: str = Depends(verificar_token)):
    """Elimina un tipo de transacción."""
    response = requests.delete(
        f"{URL_FINANZAS}/finanzas/tipos-transaccion/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    return {"mensaje": "Tipo de transacción eliminado correctamente"} if response.status_code in [200, 204] else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al eliminar tipo de transacción"))

####################################### ESTADOS DE TRANSACCIÓN #######################################

@router.get("/estados-transaccion", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_estados_transaccion(request: Request):
    """Obtiene todos los estados de transacción."""
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.get(
        f"{URL_FINANZAS}/finanzas/estados-transaccion",
        headers={"Authorization": auth_header}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail=f"Error al obtener estados de transacción: {response.text}")

@router.get("/estados-transaccion/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_estado_transaccion(id: str, request: Request):
    """Obtiene un estado de transacción por su ID."""
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.get(
        f"{URL_FINANZAS}/finanzas/estados-transaccion/{id}",
        headers={"Authorization": auth_header}
    )

    if response.status_code == 200:
        return response.json()

    if response.status_code == 404:
        error_data = response.json()
        raise HTTPException(status_code=404, detail=error_data.get("error", "Estado de transacción no encontrado"))

    raise HTTPException(status_code=response.status_code, detail=f"Error al obtener estado de transacción: {response.text}")

@router.post("/estados-transaccion", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def crear_estado_transaccion(request: Request):
    """Crea un nuevo estado de transacción."""
    data = await request.json()
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.post(
        f"{URL_FINANZAS}/finanzas/estados-transaccion",
        json=data,
        headers={"Authorization": auth_header, "Content-Type": "application/json"}
    )

    if response.status_code in [200, 201]:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail=f"Error al crear estado de transacción: {response.text}")

@router.put("/estados-transaccion/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def actualizar_estado_transaccion(id: str, request: Request):
    """Actualiza un estado de transacción."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.put(
        f"{URL_FINANZAS}/finanzas/estados-transaccion/{id}",
        json=await request.json(),
        headers={"Authorization": auth_header, "Content-Type": "application/json"}
    )

    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al actualizar estado de transacción"))

@router.delete("/estados-transaccion/{id}", dependencies=[Depends(verificar_rol("ADMIN"))])
async def eliminar_estado_transaccion(id: str, request: Request):
    """Elimina un estado de transacción."""
    response = requests.delete(
        f"{URL_FINANZAS}/finanzas/estados-transaccion/{id}",
        headers={"Authorization": request.headers.get("Authorization")}
    )

    # Aceptar tanto 200 como 204 como códigos de éxito
    if response.status_code in [200, 204]:
        return {"mensaje": "Estado de transacción eliminado correctamente"}
    else:
        return HTTPException(status_code=response.status_code, detail=f"Error al eliminar estado de transacción: {response.text}")

@router.post("/estados-transaccion/inicializar", dependencies=[Depends(verificar_rol("ADMIN"))])
async def inicializar_estados_predeterminados(request: Request):
    """Inicializa los estados de transacción predeterminados."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.post(
        f"{URL_FINANZAS}/finanzas/estados-transaccion/inicializar",
        headers={"Authorization": auth_header}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail=f"Error al inicializar estados predeterminados: {response.text}")
