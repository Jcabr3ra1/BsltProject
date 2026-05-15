from fastapi import APIRouter, HTTPException, Request
from Servicios.CuentaServicio import CuentaServicio

router = APIRouter()
servicio = CuentaServicio()

@router.get("/")
def obtener_cuentas():
    return servicio.obtener_todas()

@router.post("/")
def crear_cuenta(info_cuenta: dict):
    if "tipo" not in info_cuenta and "type" in info_cuenta:
        info_cuenta["tipo"] = info_cuenta["type"]
    resultado = servicio.crear(info_cuenta)
    if isinstance(resultado, tuple) and len(resultado) > 1:
        raise HTTPException(status_code=resultado[1], detail=resultado[0])
    return resultado

@router.get("/{id}")
def obtener_cuenta(id: str):
    resultado = servicio.obtener_por_id(id)
    if isinstance(resultado, tuple) and len(resultado) > 1:
        raise HTTPException(status_code=resultado[1], detail=resultado[0])
    return resultado

@router.put("/{id}")
def actualizar_cuenta(id: str, info_cuenta: dict):
    resultado = servicio.actualizar(id, info_cuenta)
    if isinstance(resultado, tuple) and len(resultado) > 1:
        raise HTTPException(status_code=resultado[1], detail=resultado[0])
    return resultado

@router.delete("/{id}")
def eliminar_cuenta(id: str):
    resultado = servicio.eliminar(id)
    return resultado

@router.get("/usuario/{id_usuario}")
def obtener_cuentas_por_usuario(id_usuario: str):
    resultado = servicio.obtener_por_usuario(id_usuario)
    return resultado

@router.put("/{id}/usuario/{id_usuario}")
def asignar_usuario_a_cuenta(id: str, id_usuario: str, request: Request = None):
    auth_token = None
    if request:
        auth_header = request.headers.get("Authorization")
        if auth_header:
            auth_token = auth_header
    resultado = servicio.asignar_usuario_a_cuenta(id, id_usuario, auth_token)
    if isinstance(resultado, tuple) and len(resultado) > 1:
        raise HTTPException(status_code=resultado[1], detail=resultado[0])
    return resultado
