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


