import requests
from fastapi import APIRouter, Depends, HTTPException, Request
from middleware.autenticacion import verificar_token, verificar_rol, verificar_roles_permitidos
import json

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

@router.post("/bolsillos", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
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

    if response.status_code == 204:
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

@router.put("/cuentas/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
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

    if response.status_code == 204:
        return {"mensaje": "Cuenta eliminada correctamente"}
    else:
        return HTTPException(status_code=response.status_code, detail=f"Error al eliminar cuenta: {response.text}")

@router.get("/cuentas/usuario/{id_usuario}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "USER", "MODERATOR"]))])
async def obtener_cuentas_por_usuario(id_usuario: str, request: Request):
    """Obtiene las cuentas asociadas a un usuario."""
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    response = requests.get(
        f"{URL_FINANZAS}/finanzas/cuentas/usuario/{id_usuario}",
        headers={"Authorization": auth_header}
    )

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail=f"Error al obtener cuentas del usuario: {response.text}")

@router.put("/cuentas/{id}/usuario/{id_usuario}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def asignar_usuario_a_cuenta(id: str, id_usuario: str, request: Request):
    """Asigna un usuario a una cuenta en el sistema financiero."""
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

####################################### TRANSACCIONES #######################################
@router.get("/transacciones", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_transacciones(token: str = Depends(verificar_token)):
    """Obtiene todas las transacciones."""
    response = requests.get(
        f"{URL_FINANZAS}/transacciones",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al obtener transacciones"))

@router.get("/transacciones/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_transaccion(id: str, token: str = Depends(verificar_token)):
    """Obtiene una transacción por su ID."""
    response = requests.get(
        f"{URL_FINANZAS}/transacciones/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Transacción no encontrada"))

@router.post("/transacciones", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def crear_transaccion(request: Request, token: str = Depends(verificar_token)):
    """Crea una nueva transacción."""
    response = requests.post(
        f"{URL_FINANZAS}/transacciones",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al crear transacción"))

@router.put("/transacciones/{id}/cancel", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def anular_transaccion(id: str, token: str = Depends(verificar_token)):
    """Anula una transacción."""
    response = requests.put(
        f"{URL_FINANZAS}/transacciones/{id}/cancel",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al anular transacción"))

####################################### TRANSACCIONES ESPECÍFICAS #######################################
@router.post("/transferencias/cuenta-cuenta", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def transferencia_cuenta_cuenta(request: Request, token: str = Depends(verificar_token)):
    """Realiza una transferencia de cuenta a cuenta."""
    response = requests.post(
        f"{URL_FINANZAS}/transferencias/cuenta-cuenta",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error en la transferencia"))

@router.post("/transferencias/cuenta-bolsillo", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def transferencia_cuenta_bolsillo(request: Request, token: str = Depends(verificar_token)):
    """Realiza una transferencia de cuenta a bolsillo."""
    response = requests.post(
        f"{URL_FINANZAS}/transferencias/cuenta-bolsillo",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error en la transferencia"))

@router.post("/transferencias/bolsillo-cuenta", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def transferencia_bolsillo_cuenta(request: Request, token: str = Depends(verificar_token)):
    """Realiza una transferencia de bolsillo a cuenta."""
    response = requests.post(
        f"{URL_FINANZAS}/transferencias/bolsillo-cuenta",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error en la transferencia"))

@router.post("/consignaciones/banco-cuenta", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def consignacion_banco_cuenta(request: Request, token: str = Depends(verificar_token)):
    """Realiza una consignación de banco a cuenta."""
    response = requests.post(
        f"{URL_FINANZAS}/consignaciones/banco-cuenta",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error en la consignación"))

@router.post("/consignaciones/banco-bolsillo", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR"]))])
async def consignacion_banco_bolsillo(request: Request, token: str = Depends(verificar_token)):
    """Realiza una consignación de banco a bolsillo."""
    response = requests.post(
        f"{URL_FINANZAS}/consignaciones/banco-bolsillo",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error en la consignación"))

@router.post("/retiros/cuenta-banco", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def retiro_cuenta_banco(request: Request, token: str = Depends(verificar_token)):
    """Realiza un retiro de cuenta a banco."""
    response = requests.post(
        f"{URL_FINANZAS}/retiros/cuenta-banco",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error en el retiro"))

@router.get("/transacciones/historial", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def historial_transacciones(
    request: Request,
    token: str = Depends(verificar_token),
    fechaInicio: str = None,
    fechaFin: str = None,
    tipo: str = None
):
    """Obtiene el historial de transacciones con filtros opcionales."""
    params = {}
    if fechaInicio:
        params["fechaInicio"] = fechaInicio
    if fechaFin:
        params["fechaFin"] = fechaFin
    if tipo:
        params["tipo"] = tipo

    response = requests.get(
        f"{URL_FINANZAS}/transacciones/historial",
        params=params,
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al obtener historial"))

####################################### TIPO MOVIMIENTO #######################################
@router.get("/tipos-movimiento", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_tipos_movimiento(token: str = Depends(verificar_token)):
    """Obtiene todos los tipos de movimiento."""
    response = requests.get(
        f"{URL_FINANZAS}/tipos-movimiento",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al obtener tipos de movimiento"))

@router.post("/tipos-movimiento", dependencies=[Depends(verificar_roles_permitidos(["ADMIN"]))])
async def crear_tipo_movimiento(request: Request, token: str = Depends(verificar_token)):
    """Crea un nuevo tipo de movimiento."""
    response = requests.post(
        f"{URL_FINANZAS}/tipos-movimiento",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al crear tipo de movimiento"))

@router.get("/tipos-movimiento/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_tipo_movimiento(id: str, token: str = Depends(verificar_token)):
    """Obtiene un tipo de movimiento por su ID."""
    response = requests.get(
        f"{URL_FINANZAS}/tipos-movimiento/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Tipo de movimiento no encontrado"))

@router.put("/tipos-movimiento/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN"]))])
async def actualizar_tipo_movimiento(id: str, request: Request, token: str = Depends(verificar_token)):
    """Actualiza un tipo de movimiento."""
    response = requests.put(
        f"{URL_FINANZAS}/tipos-movimiento/{id}",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al actualizar tipo de movimiento"))

@router.delete("/tipos-movimiento/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN"]))])
async def eliminar_tipo_movimiento(id: str, token: str = Depends(verificar_token)):
    """Elimina un tipo de movimiento."""
    response = requests.delete(
        f"{URL_FINANZAS}/tipos-movimiento/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    return {"mensaje": "Tipo de movimiento eliminado correctamente"} if response.status_code in [200, 204] else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al eliminar tipo de movimiento"))

####################################### TIPO TRANSACCIÓN #######################################
@router.get("/tipos-transaccion", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_tipos_transaccion(token: str = Depends(verificar_token)):
    """Obtiene todos los tipos de transacción."""
    response = requests.get(
        f"{URL_FINANZAS}/tipos-transaccion",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al obtener tipos de transacción"))

@router.post("/tipos-transaccion", dependencies=[Depends(verificar_roles_permitidos(["ADMIN"]))])
async def crear_tipo_transaccion(request: Request, token: str = Depends(verificar_token)):
    """Crea un nuevo tipo de transacción."""
    response = requests.post(
        f"{URL_FINANZAS}/tipos-transaccion",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al crear tipo de transacción"))

@router.get("/tipos-transaccion/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN", "MODERATOR", "USER"]))])
async def obtener_tipo_transaccion(id: str, token: str = Depends(verificar_token)):
    """Obtiene un tipo de transacción por su ID."""
    response = requests.get(
        f"{URL_FINANZAS}/tipos-transaccion/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Tipo de transacción no encontrado"))

@router.put("/tipos-transaccion/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN"]))])
async def actualizar_tipo_transaccion(id: str, request: Request, token: str = Depends(verificar_token)):
    """Actualiza un tipo de transacción."""
    response = requests.put(
        f"{URL_FINANZAS}/tipos-transaccion/{id}",
        json=await request.json(),
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al actualizar tipo de transacción"))

@router.delete("/tipos-transaccion/{id}", dependencies=[Depends(verificar_roles_permitidos(["ADMIN"]))])
async def eliminar_tipo_transaccion(id: str, token: str = Depends(verificar_token)):
    """Elimina un tipo de transacción."""
    response = requests.delete(
        f"{URL_FINANZAS}/tipos-transaccion/{id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    return {"mensaje": "Tipo de transacción eliminado correctamente"} if response.status_code in [200, 204] else HTTPException(status_code=response.status_code, detail=response.json().get("error", "Error al eliminar tipo de transacción"))
