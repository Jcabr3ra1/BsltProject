from fastapi import APIRouter, HTTPException
from Servicios.EstadoTransaccionServicio import EstadoTransaccionServicio

router = APIRouter()
servicio = EstadoTransaccionServicio()

@router.get("/")
def obtener_estados_transaccion():
    return servicio.obtener_todos()

@router.get("/{id}")
def obtener_estado_transaccion(id: str):
    resultado = servicio.obtener_por_id(id)
    if "error" in resultado:
        raise HTTPException(status_code=404, detail=resultado["error"])
    return resultado

@router.post("/")
def crear_estado_transaccion(info_estado: dict):
    resultado = servicio.crear(info_estado)
    if "error" in resultado:
        raise HTTPException(status_code=400, detail=resultado["error"])
    return resultado

@router.put("/{id}")
def actualizar_estado_transaccion(id: str, info_estado: dict):
    resultado = servicio.actualizar(id, info_estado)
    if "error" in resultado:
        raise HTTPException(status_code=400, detail=resultado["error"])
    return resultado

@router.delete("/{id}")
def eliminar_estado_transaccion(id: str):
    resultado = servicio.eliminar(id)
    if "error" in resultado:
        raise HTTPException(status_code=400, detail=resultado["error"])
    if "mensaje" in resultado:
        return {"mensaje": resultado["mensaje"]}
    return resultado

@router.post("/inicializar")
def inicializar_estados_predeterminados():
    return servicio.inicializar_estados_predeterminados()
