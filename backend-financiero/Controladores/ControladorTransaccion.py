from fastapi import APIRouter, HTTPException
from Servicios.TransaccionServicio import TransaccionServicio

router = APIRouter()
servicio = TransaccionServicio()

@router.get("/")
def obtener_transacciones():
    return servicio.obtener_todas()

@router.get("/{id}")
def obtener_transaccion(id: str):
    resultado = servicio.obtener_por_id(id)
    if "error" in resultado:
        raise HTTPException(status_code=404, detail=resultado["error"])
    return resultado

@router.post("/")
def crear_transaccion(info_transaccion: dict):
    resultado = servicio.crear(info_transaccion)
    if "error" in resultado:
        raise HTTPException(status_code=400, detail=resultado["error"])
    return resultado

@router.put("/{id}")
def actualizar_transaccion(id: str, info_transaccion: dict):
    resultado = servicio.actualizar(id, info_transaccion)
    if "error" in resultado:
        raise HTTPException(status_code=400, detail=resultado["error"])
    return resultado

@router.put("/{id}/aprobar")
def aprobar_transaccion(id: str):
    info_transaccion = {"estado": "APROBADA"}
    resultado = servicio.actualizar(id, info_transaccion)
    if isinstance(resultado, tuple):
        error_msg, error_code = resultado
        raise HTTPException(status_code=error_code, detail=error_msg)
    if "error" in resultado:
        raise HTTPException(status_code=400, detail=resultado["error"])
    return resultado

@router.put("/{id}/anular")
def anular_transaccion(id: str, reintegrar_fondos: bool = True):
    resultado = servicio.anular(id, reintegrar_fondos=reintegrar_fondos)
    if isinstance(resultado, tuple):
        error_msg, error_code = resultado
        raise HTTPException(status_code=error_code, detail=error_msg)
    if "error" in resultado:
        raise HTTPException(status_code=500, detail=resultado["error"])
    return resultado

@router.delete("/{id}")
def eliminar_transaccion_permanente(id: str):
    resultado = servicio.eliminar_permanente(id)
    if isinstance(resultado, tuple):
        error_msg, error_code = resultado
        raise HTTPException(status_code=error_code, detail=error_msg)
    if "error" in resultado:
        raise HTTPException(status_code=500, detail=resultado["error"])
    return {"message": f"Transacción {id} eliminada permanentemente", "eliminada": True}

@router.get("/usuario/{id_usuario}")
def obtener_transacciones_por_usuario(id_usuario: str):
    resultado = servicio.obtener_por_usuario(id_usuario)
    if isinstance(resultado, tuple) and len(resultado) > 1 and "error" in resultado[0]:
        raise HTTPException(status_code=404, detail=resultado[0]["error"])
    return resultado

@router.get("/usuario/{id_usuario}/proximos-pagos")
def obtener_proximos_pagos(id_usuario: str):
    try:
        return servicio.obtener_proximos_pagos(id_usuario)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener próximos pagos: {str(e)}")

@router.get("/historial")
def historial_transacciones(fechaInicio: str = None, fechaFin: str = None, tipo: str = None):
    return servicio.obtener_todas()

@router.post("/cuenta-cuenta")
def transferencia_cuenta_cuenta(data: dict):
    if not all(k in data for k in ["cuentaOrigenId", "cuentaDestinoId", "tipoMovimientoId", "monto"]):
        raise HTTPException(status_code=400, detail="Datos incompletos para la transferencia")
    info_transaccion = {
        "id_cuenta_origen": data["cuentaOrigenId"],
        "id_cuenta_destino": data["cuentaDestinoId"],
        "id_tipo_movimiento": data["tipoMovimientoId"],
        "id_tipo_transaccion": data.get("tipoTransaccionId"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Transferencia entre cuentas"),
        "uuid_transaccion": data.get("uuid_transaccion")
    }
    return servicio._transferenciaCuentaCuenta(info_transaccion, data["monto"])

@router.post("/cuenta-bolsillo")
def transferencia_cuenta_bolsillo(data: dict):
    if not all(k in data for k in ["cuentaOrigenId", "bolsilloDestinoId", "tipoMovimientoId", "monto"]):
        raise HTTPException(status_code=400, detail="Datos incompletos para la transferencia")
    info_transaccion = {
        "id_cuenta_origen": data["cuentaOrigenId"],
        "id_bolsillo_destino": data["bolsilloDestinoId"],
        "id_tipo_movimiento": data["tipoMovimientoId"],
        "id_tipo_transaccion": data.get("tipoTransaccionId"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Transferencia de cuenta a bolsillo"),
        "uuid_transaccion": data.get("uuid_transaccion")
    }
    return servicio._transferenciaCuentaBolsillo(info_transaccion, data["monto"])

@router.post("/bolsillo-bolsillo")
def transferencia_bolsillo_bolsillo(data: dict):
    if not all(k in data for k in ["bolsilloOrigenId", "bolsilloDestinoId", "tipoMovimientoId", "monto"]):
        raise HTTPException(status_code=400, detail="Datos incompletos para la transferencia")
    info_transaccion = {
        "id_bolsillo_origen": data["bolsilloOrigenId"],
        "id_bolsillo_destino": data["bolsilloDestinoId"],
        "id_tipo_movimiento": data["tipoMovimientoId"],
        "id_tipo_transaccion": data.get("tipoTransaccionId"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Transferencia de bolsillo a bolsillo"),
        "uuid_transaccion": data.get("uuid_transaccion")
    }
    return servicio._transferenciaBolsilloBolsillo(info_transaccion, data["monto"])

@router.post("/banco-cuenta")
def consignacion_banco_cuenta(data: dict):
    if not all(k in data for k in ["cuentaDestinoId", "tipoMovimientoId", "monto"]):
        raise HTTPException(status_code=400, detail="Datos incompletos para la consignación")
    info_transaccion = {
        "id_cuenta_destino": data["cuentaDestinoId"],
        "id_tipo_movimiento": data["tipoMovimientoId"],
        "id_tipo_transaccion": data.get("tipoTransaccionId"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Consignación de banco a cuenta"),
        "uuid_transaccion": data.get("uuid_transaccion")
    }
    return servicio._consignacionBancoCuenta(info_transaccion, data["monto"])

@router.post("/banco-bolsillo")
def consignacion_banco_bolsillo(data: dict):
    if not all(k in data for k in ["bolsilloDestinoId", "tipoMovimientoId", "monto"]):
        raise HTTPException(status_code=400, detail="Datos incompletos para la consignación")
    info_transaccion = {
        "id_bolsillo_destino": data["bolsilloDestinoId"],
        "id_tipo_movimiento": data["tipoMovimientoId"],
        "id_tipo_transaccion": data.get("tipoTransaccionId"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Consignación de banco a bolsillo"),
        "uuid_transaccion": data.get("uuid_transaccion")
    }
    return servicio._consignacionBancoBolsillo(info_transaccion, data["monto"])

@router.post("/cuenta-banco")
def retiro_cuenta_banco(data: dict):
    if not all(k in data for k in ["cuentaOrigenId", "tipoMovimientoId", "monto"]):
        raise HTTPException(status_code=400, detail="Datos incompletos para el retiro")
    info_transaccion = {
        "id_cuenta_origen": data["cuentaOrigenId"],
        "id_tipo_movimiento": data["tipoMovimientoId"],
        "id_tipo_transaccion": data.get("tipoTransaccionId"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Retiro de cuenta a banco"),
        "uuid_transaccion": data.get("uuid_transaccion")
    }
    return servicio._retiroCuentaBanco(info_transaccion, data["monto"])

@router.post("/bolsillo-cuenta")
def retiro_bolsillo_cuenta(data: dict):
    if not all(k in data for k in ["bolsilloOrigenId", "cuentaDestinoId", "tipoMovimientoId", "monto"]):
        raise HTTPException(status_code=400, detail="Datos incompletos para el retiro")
    info_transaccion = {
        "id_bolsillo_origen": data["bolsilloOrigenId"],
        "id_cuenta_destino": data["cuentaDestinoId"],
        "id_tipo_movimiento": data["tipoMovimientoId"],
        "id_tipo_transaccion": data.get("tipoTransaccionId"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Retiro de bolsillo a cuenta"),
        "uuid_transaccion": data.get("uuid_transaccion")
    }
    return servicio._retiroBolsilloCuenta(info_transaccion, data["monto"])

@router.post("/bolsillo-banco")
def retiro_bolsillo_banco(data: dict):
    if not all(k in data for k in ["bolsilloOrigenId", "tipoMovimientoId", "monto"]):
        raise HTTPException(status_code=400, detail="Datos incompletos para el retiro")
    info_transaccion = {
        "id_bolsillo_origen": data["bolsilloOrigenId"],
        "id_tipo_movimiento": data["tipoMovimientoId"],
        "id_tipo_transaccion": data.get("tipoTransaccionId"),
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Retiro de bolsillo a banco"),
        "uuid_transaccion": data.get("uuid_transaccion")
    }
    return servicio._retiroBolsilloBanco(info_transaccion, data["monto"])
