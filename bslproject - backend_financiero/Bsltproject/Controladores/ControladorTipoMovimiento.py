from fastapi import APIRouter, HTTPException
from Servicios.TipoMovimientoServicio import TipoMovimientoServicio

router = APIRouter()
servicio = TipoMovimientoServicio()

@router.get("/")
def obtener_tipos_movimiento():
    return servicio.obtener_todos()

@router.post("/")
def crear_tipo_movimiento(data: dict):
    return servicio.crear(data)

@router.get("/{id}")
def obtener_tipo_movimiento(id: str):
    tipo = servicio.obtener_por_id(id)
    if "error" in tipo:
        raise HTTPException(status_code=404, detail=tipo["error"])
    return tipo

@router.put("/{id}")
def actualizar_tipo_movimiento(id: str, data: dict):
    return servicio.actualizar(id, data)

@router.delete("/{id}")
def eliminar_tipo_movimiento(id: str):
    return servicio.eliminar(id)
