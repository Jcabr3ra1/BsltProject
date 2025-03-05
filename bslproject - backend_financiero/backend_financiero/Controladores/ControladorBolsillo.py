from fastapi import APIRouter, HTTPException
from Servicios.BolsilloServicio import BolsilloServicio

router = APIRouter()
servicio = BolsilloServicio()

@router.get("/")
def obtener_bolsillos():
    return servicio.obtener_todos()

@router.post("/")
def crear_bolsillo(info_bolsillo: dict):
    return servicio.crear(info_bolsillo)

@router.get("/{id}")
def obtener_bolsillo(id: str):
    bolsillo = servicio.obtener_por_id(id)

    if isinstance(bolsillo, tuple):  # ✅ Si la función devuelve un error con código HTTP
        error_msg, error_code = bolsillo
        raise HTTPException(status_code=error_code, detail=error_msg)

    return bolsillo

@router.put("/{id}")
def actualizar_bolsillo(id: str, info_bolsillo: dict):
    return servicio.actualizar(id, info_bolsillo)

@router.delete("/{id}")
def eliminar_bolsillo(id: str):
    return servicio.eliminar(id)

@router.put("/{id_bolsillo}/cuenta/{id_cuenta}")
def asignar_cuenta_a_bolsillo(id_bolsillo: str, id_cuenta: str):
    resultado = servicio.asignar_cuenta(id_bolsillo, id_cuenta)
    if "error" in resultado:
        raise HTTPException(status_code=404, detail=resultado["error"])
    return resultado
