import requests
from fastapi import APIRouter, Depends, HTTPException, Request
from middleware.autenticacion import verificar_token, verificar_rol, verificar_roles_permitidos
import json
from typing import Dict, Any

with open("configuracion/config.json", "r") as archivo_config:
    configuracion = json.load(archivo_config)

URL_SEGURIDAD = configuracion["servicios"]["seguridad"]
URL_FINANZAS = configuracion["servicios"]["finanzas"]

router = APIRouter(prefix="/finanzas")

@router.get("/bolsillos", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_bolsillos(request: Request):
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
    response = requests.put(
        f"{URL_FINANZAS}/finanzas/bolsillos/{id_bolsillo}/cuentas/{id_cuenta}",
        headers={"Authorization": request.headers.get("Authorization")}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=f"Error al asignar cuenta a bolsillo: {response.text}")

@router.delete("/bolsillos/{id}/desasociar", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def eliminar_bolsillo_y_quitar_referencia(id: str, request: Request):
    response = requests.delete(
        f"{URL_FINANZAS}/finanzas/bolsillos/{id}/desasociar",
        headers={"Authorization": request.headers.get("Authorization")}
    )
    if response.status_code == 200:
        return {"mensaje": "Bolsillo eliminado y cuenta desasociada"}
    raise HTTPException(status_code=response.status_code, detail=f"Error al eliminar bolsillo: {response.text}")


@router.post("/cuentas", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def crear_cuenta(request: Request):
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
    response = requests.delete(
        f"{URL_FINANZAS}/finanzas/cuentas/{id}",
        headers={"Authorization": request.headers.get("Authorization")}
    )

    if response.status_code in [200, 204]:
        return {"mensaje": "Cuenta eliminada correctamente"}
    else:
        raise HTTPException(status_code=response.status_code, detail=f"Error al eliminar cuenta: {response.text}")

@router.get("/cuentas/usuario/{id_usuario}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_cuentas_por_usuario(id_usuario: str, request: Request):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

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
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.put(
        f"{URL_FINANZAS}/finanzas/cuentas/{id}/usuario/{id_usuario}",
        headers={"Authorization": auth_header}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail=f"Error al asignar usuario a cuenta: {response.text}")


@router.put("/usuarios/{userId}/cuentas/desasociar/{cuentaId}")
async def desasociar_cuenta_de_usuario(userId: str, cuentaId: str, request: Request):
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


@router.get("/transacciones", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_transacciones(token_info: Dict[str, Any] = Depends(verificar_token)):
    response = requests.get(
        f"{URL_FINANZAS}/finanzas/transacciones",
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al obtener transacciones")

@router.get("/transacciones/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_transaccion(id: str, token_info: Dict[str, Any] = Depends(verificar_token)):
    response = requests.get(
        f"{URL_FINANZAS}/finanzas/transacciones/{id}",
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Transacción no encontrada")

@router.post("/transacciones", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def crear_transaccion(request: Request, token_info: Dict[str, Any] = Depends(verificar_token)):
    response = requests.post(
        f"{URL_FINANZAS}/finanzas/transacciones",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al crear transacción")

@router.put("/transacciones/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def actualizar_transaccion(id: str, request: Request, token_info: Dict[str, Any] = Depends(verificar_token)):
    response = requests.put(
        f"{URL_FINANZAS}/finanzas/transacciones/{id}",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al actualizar transacción")

@router.put("/transacciones/{id}/anular", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def anular_transaccion(id: str, token_info: Dict[str, Any] = Depends(verificar_token)):
    response = requests.put(
        f"{URL_FINANZAS}/finanzas/transacciones/{id}/anular",
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al anular transacción")

@router.put("/transacciones/{id}/aprobar", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def aprobar_transaccion(id: str, token_info: Dict[str, Any] = Depends(verificar_token)):
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


@router.get("/transacciones/usuario/{id_usuario}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_transacciones_por_usuario(id_usuario: str, token_info: Dict[str, Any] = Depends(verificar_token)):
    response = requests.get(
        f"{URL_FINANZAS}/finanzas/transacciones/usuario/{id_usuario}",
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al obtener transacciones del usuario")

@router.get("/transacciones/usuario/{id_usuario}/proximos-pagos", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_proximos_pagos(id_usuario: str, token_info: Dict[str, Any] = Depends(verificar_token)):
    response = requests.get(
        f"{URL_FINANZAS}/finanzas/transacciones/usuario/{id_usuario}/proximos-pagos",
        headers={"Authorization": f"Bearer {token_info['token']}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail="Error al obtener próximos pagos del usuario")


@router.post("/transferencias/cuenta-cuenta", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def transferencia_cuenta_cuenta(request: Request, token_info: Dict[str, Any] = Depends(verificar_token)):
    data = await request.json()

    required_fields = ["id_cuenta_origen", "id_cuenta_destino", "id_tipo_movimiento", "monto"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Campos faltantes en la solicitud: {', '.join(missing)}"
        )

    payload_backend = {
        "cuentaOrigenId": data["id_cuenta_origen"],
        "cuentaDestinoId": data["id_cuenta_destino"],
        "tipoMovimientoId": data["id_tipo_movimiento"],
        "tipoTransaccionId": data.get("id_tipo_transaccion"),
        "descripcion": data.get("descripcion", "Transferencia entre cuentas"),
        "monto": data["monto"],
        "uuid_transaccion": data.get("uuid_transaccion")
    }

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
    data = await request.json()

    required_fields = ["id_cuenta_origen", "id_bolsillo_destino", "id_tipo_movimiento", "monto"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Campos faltantes en la solicitud: {', '.join(missing)}"
        )

    payload_backend = {
        "cuentaOrigenId": data["id_cuenta_origen"],
        "bolsilloDestinoId": data["id_bolsillo_destino"],
        "tipoMovimientoId": data["id_tipo_movimiento"],
        "tipoTransaccionId": data.get("id_tipo_transaccion"),
        "uuid_transaccion": data.get("uuid_transaccion"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Transferencia de cuenta a bolsillo")
    }

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
    data = await request.json()

    required_fields = ["id_bolsillo_origen", "id_cuenta_destino", "id_tipo_movimiento", "monto"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Campos faltantes en la solicitud: {', '.join(missing)}"
        )

    payload_backend = {
        "bolsilloOrigenId": data["id_bolsillo_origen"],
        "cuentaDestinoId": data["id_cuenta_destino"],
        "tipoMovimientoId": data["id_tipo_movimiento"],
        "tipoTransaccionId": data.get("id_tipo_transaccion"),
        "uuid_transaccion": data.get("uuid_transaccion"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Transferencia de bolsillo a cuenta")
    }

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
    data = await request.json()

    required_fields = ["id_bolsillo_origen", "id_bolsillo_destino", "id_tipo_movimiento", "monto"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Campos faltantes en la solicitud: {', '.join(missing)}"
        )

    payload_backend = {
        "bolsilloOrigenId": data["id_bolsillo_origen"],
        "bolsilloDestinoId": data["id_bolsillo_destino"],
        "tipoMovimientoId": data["id_tipo_movimiento"],
        "tipoTransaccionId": data.get("id_tipo_transaccion"),
        "uuid_transaccion": data.get("uuid_transaccion"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Transferencia entre bolsillos")
    }

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


@router.post("/consignaciones/banco-cuenta", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def consignacion_banco_cuenta(request: Request, token_info: Dict[str, Any] = Depends(verificar_token)):
    data = await request.json()

    required_fields = ["id_cuenta_destino", "id_tipo_movimiento", "monto"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Campos faltantes en la solicitud: {', '.join(missing)}"
        )

    payload_backend = {
        "cuentaDestinoId": data["id_cuenta_destino"],
        "tipoMovimientoId": data["id_tipo_movimiento"],
        "tipoTransaccionId": data.get("id_tipo_transaccion"),
        "uuid_transaccion": data.get("uuid_transaccion"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Consignación de banco a cuenta")
    }

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
    data = await request.json()

    required_fields = ["id_bolsillo_destino", "id_tipo_movimiento", "monto"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Campos faltantes en la solicitud: {', '.join(missing)}"
        )

    payload_backend = {
        "bolsilloDestinoId": data["id_bolsillo_destino"],
        "tipoMovimientoId": data["id_tipo_movimiento"],
        "tipoTransaccionId": data.get("id_tipo_transaccion"),
        "uuid_transaccion": data.get("uuid_transaccion"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Consignación de banco a bolsillo")
    }

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




@router.post("/retiros/cuenta-banco", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def retiro_cuenta_banco(request: Request, token_info: Dict[str, Any] = Depends(verificar_token)):
    data = await request.json()

    required_fields = ["id_cuenta_origen", "id_tipo_movimiento", "monto"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Campos faltantes en la solicitud: {', '.join(missing)}"
        )

    payload_backend = {
        "cuentaOrigenId": data["id_cuenta_origen"],
        "tipoMovimientoId": data["id_tipo_movimiento"],
        "tipoTransaccionId": data.get("id_tipo_transaccion"),
        "uuid_transaccion": data.get("uuid_transaccion"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Retiro de cuenta a banco")
    }

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
    data = await request.json()

    required_fields = ["id_bolsillo_origen", "id_cuenta_destino", "id_tipo_movimiento", "monto"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Campos faltantes en la solicitud: {', '.join(missing)}"
        )

    payload_backend = {
        "bolsilloOrigenId": data["id_bolsillo_origen"],
        "cuentaDestinoId": data["id_cuenta_destino"],
        "tipoMovimientoId": data["id_tipo_movimiento"],
        "tipoTransaccionId": data.get("id_tipo_transaccion"),
        "uuid_transaccion": data.get("uuid_transaccion"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Retiro de bolsillo a cuenta")
    }

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
    data = await request.json()

    required_fields = ["id_bolsillo_origen", "id_tipo_movimiento", "monto"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Campos faltantes en la solicitud: {', '.join(missing)}"
        )

    payload_backend = {
        "bolsilloOrigenId": data["id_bolsillo_origen"],
        "tipoMovimientoId": data["id_tipo_movimiento"],
        "tipoTransaccionId": data.get("id_tipo_transaccion"),
        "uuid_transaccion": data.get("uuid_transaccion"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Retiro de bolsillo a banco")
    }

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

@router.get("/tipos-movimiento")
async def obtener_tipos_movimiento(request: Request):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.get(
        f"{URL_FINANZAS}/finanzas/tipos-movimiento",
        headers={"Authorization": auth_header}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail=f"Error al obtener tipos de movimiento: {response.text}")

@router.post("/tipos-movimiento")
async def crear_tipo_movimiento(request: Request):
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


@router.get("/tipos-transaccion", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_tipos_transaccion(token: str = Depends(verificar_token)):
    response = requests.get(
        f"{URL_FINANZAS}/finanzas/tipos-transaccion",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al obtener tipos de transacción"))

@router.post("/tipos-transaccion", dependencies=[Depends(verificar_roles_permitidos(["ADMIN"]))])
async def crear_tipo_transaccion(request: Request, token: str = Depends(verificar_token)):
    response = requests.post(
        f"{URL_FINANZAS}/finanzas/tipos-transaccion",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al crear tipo de transacción"))

@router.get("/tipos-transaccion/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_tipo_transaccion(id: str, token: str = Depends(verificar_token)):
    response = requests.get(
        f"{URL_FINANZAS}/finanzas/tipos-transaccion/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Tipo de transacción no encontrado"))

@router.put("/tipos-transaccion/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN"]))])
async def actualizar_tipo_transaccion(id: str, request: Request, token: str = Depends(verificar_token)):
    response = requests.put(
        f"{URL_FINANZAS}/finanzas/tipos-transaccion/{id}",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al actualizar tipo de transacción"))

@router.delete("/tipos-transaccion/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN"]))])
async def eliminar_tipo_transaccion(id: str, token: str = Depends(verificar_token)):
    response = requests.delete(
        f"{URL_FINANZAS}/finanzas/tipos-transaccion/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    return {"mensaje": "Tipo de transacción eliminado correctamente"} if response.status_code in [200, 204] else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al eliminar tipo de transacción"))


@router.get("/estados-transaccion", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_estados_transaccion(request: Request):
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
    response = requests.delete(
        f"{URL_FINANZAS}/finanzas/estados-transaccion/{id}",
        headers={"Authorization": request.headers.get("Authorization")}
    )

    if response.status_code in [200, 204]:
        return {"mensaje": "Estado de transacción eliminado correctamente"}
    else:
        return HTTPException(status_code=response.status_code, detail=f"Error al eliminar estado de transacción: {response.text}")

@router.post("/estados-transaccion/inicializar", dependencies=[Depends(verificar_rol("ADMIN"))])
async def inicializar_estados_predeterminados(request: Request):
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
