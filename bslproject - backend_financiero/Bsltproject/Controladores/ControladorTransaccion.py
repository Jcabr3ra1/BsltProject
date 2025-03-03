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

@router.delete("/{id}")
def eliminar_transaccion(id: str):
    return servicio.eliminar(id)
