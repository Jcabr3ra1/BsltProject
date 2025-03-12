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

@router.put("/{id}/anular")
async def anular_transaccion(id: str):
    """Cambia el estado de una transacción a 'ANULADA' en lugar de eliminarla"""
    resultado = servicio.anular(id)
    return resultado if isinstance(resultado, dict) else HTTPException(
        status_code=500, detail="Error al anular transacción"
    )

# Rutas específicas para las operaciones de transferencia

@router.post("/cuenta-cuenta")
def transferencia_cuenta_cuenta(data: dict):
    """Realiza una transferencia entre cuentas"""
    if not all(k in data for k in ["cuentaOrigenId", "cuentaDestinoId", "tipoMovimientoId", "monto"]):
        raise HTTPException(status_code=400, detail="Datos incompletos para la transferencia")
    
    # Adaptar los nombres de campos al formato que espera el servicio
    info_transaccion = {
        "id_cuenta_origen": data["cuentaOrigenId"],
        "id_cuenta_destino": data["cuentaDestinoId"],
        "id_tipo_movimiento": data["tipoMovimientoId"],
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Transferencia entre cuentas")
    }
    
    resultado = servicio._transferenciaCuentaCuenta(info_transaccion, data["monto"])
    
    if isinstance(resultado, tuple) and len(resultado) > 1 and resultado[1] != 200:
        raise HTTPException(status_code=resultado[1], detail=resultado[0]["error"])
    
    return resultado

@router.post("/cuenta-bolsillo")
def transferencia_cuenta_bolsillo(data: dict):
    """Realiza una transferencia de cuenta a bolsillo"""
    if not all(k in data for k in ["cuentaOrigenId", "bolsilloDestinoId", "tipoMovimientoId", "monto"]):
        raise HTTPException(status_code=400, detail="Datos incompletos para la transferencia")
    
    # Adaptar los nombres de campos al formato que espera el servicio
    info_transaccion = {
        "id_cuenta_origen": data["cuentaOrigenId"],
        "id_bolsillo_destino": data["bolsilloDestinoId"],
        "id_tipo_movimiento": data["tipoMovimientoId"],
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Transferencia de cuenta a bolsillo")
    }
    
    resultado = servicio._transferenciaCuentaBolsillo(info_transaccion, data["monto"])
    
    if isinstance(resultado, tuple) and len(resultado) > 1 and resultado[1] != 200:
        raise HTTPException(status_code=resultado[1], detail=resultado[0]["error"])
    
    return resultado

@router.post("/bolsillo-cuenta")
def retiro_bolsillo_cuenta(data: dict):
    """Realiza un retiro de bolsillo a cuenta"""
    if not all(k in data for k in ["bolsilloOrigenId", "cuentaDestinoId", "tipoMovimientoId", "monto"]):
        raise HTTPException(status_code=400, detail="Datos incompletos para el retiro")
    
    # Adaptar los nombres de campos al formato que espera el servicio
    info_transaccion = {
        "id_bolsillo_origen": data["bolsilloOrigenId"],
        "id_cuenta_destino": data["cuentaDestinoId"],
        "id_tipo_movimiento": data["tipoMovimientoId"],
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Retiro de bolsillo a cuenta")
    }
    
    resultado = servicio._retiroBolsilloCuenta(info_transaccion, data["monto"])
    
    if isinstance(resultado, tuple) and len(resultado) > 1 and resultado[1] != 200:
        raise HTTPException(status_code=resultado[1], detail=resultado[0]["error"])
    
    return resultado

@router.post("/banco-cuenta")
def consignacion_banco_cuenta(data: dict):
    """Realiza una consignación de banco a cuenta"""
    if not all(k in data for k in ["cuentaDestinoId", "tipoMovimientoId", "monto"]):
        raise HTTPException(status_code=400, detail="Datos incompletos para la consignación")
    
    # Adaptar los nombres de campos al formato que espera el servicio
    info_transaccion = {
        "id_cuenta_destino": data["cuentaDestinoId"],
        "id_tipo_movimiento": data["tipoMovimientoId"],
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Consignación de banco a cuenta")
    }
    
    resultado = servicio._consignacionBancoCuenta(info_transaccion, data["monto"])
    
    if isinstance(resultado, tuple) and len(resultado) > 1 and resultado[1] != 200:
        raise HTTPException(status_code=resultado[1], detail=resultado[0]["error"])
    
    return resultado

@router.post("/banco-bolsillo")
def consignacion_banco_bolsillo(data: dict):
    """Realiza una consignación de banco a bolsillo"""
    if not all(k in data for k in ["bolsilloDestinoId", "tipoMovimientoId", "monto"]):
        raise HTTPException(status_code=400, detail="Datos incompletos para la consignación")
    
    # Adaptar los nombres de campos al formato que espera el servicio
    info_transaccion = {
        "id_bolsillo_destino": data["bolsilloDestinoId"],
        "id_tipo_movimiento": data["tipoMovimientoId"],
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Consignación de banco a bolsillo")
    }
    
    resultado = servicio._consignacionBancoBolsillo(info_transaccion, data["monto"])
    
    if isinstance(resultado, tuple) and len(resultado) > 1 and resultado[1] != 200:
        raise HTTPException(status_code=resultado[1], detail=resultado[0]["error"])
    
    return resultado

@router.post("/cuenta-banco")
def retiro_cuenta_banco(data: dict):
    """Realiza un retiro de cuenta a banco"""
    if not all(k in data for k in ["cuentaOrigenId", "tipoMovimientoId", "monto"]):
        raise HTTPException(status_code=400, detail="Datos incompletos para el retiro")
    
    # Adaptar los nombres de campos al formato que espera el servicio
    info_transaccion = {
        "id_cuenta_origen": data["cuentaOrigenId"],
        "id_tipo_movimiento": data["tipoMovimientoId"],
        "monto": data["monto"],
        "descripcion": data.get("descripcion", "Retiro de cuenta a banco")
    }
    
    resultado = servicio._retiroCuentaBanco(info_transaccion, data["monto"])
    
    if isinstance(resultado, tuple) and len(resultado) > 1 and resultado[1] != 200:
        raise HTTPException(status_code=resultado[1], detail=resultado[0]["error"])
    
    return resultado

@router.get("/historial")
def historial_transacciones(
    fechaInicio: str = None,
    fechaFin: str = None,
    tipo: str = None
):
    """Obtiene el historial de transacciones con filtros opcionales"""
    # Aquí implementarías la lógica para obtener el historial de transacciones
    # con los filtros proporcionados
    # Por ahora, simplemente devolvemos todas las transacciones
    return servicio.obtener_todas()
