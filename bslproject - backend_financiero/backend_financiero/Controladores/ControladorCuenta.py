from fastapi import APIRouter, Request, HTTPException
from Servicios.CuentaServicio import CuentaServicio


router = APIRouter()
servicio = CuentaServicio()

@router.get("/")
def obtener_cuentas():
    return servicio.obtener_todas()

@router.post("/")
def crear_cuenta(info_cuenta: dict):
    return servicio.crear(info_cuenta)

@router.get("/{id}")
def obtener_cuenta(id: str):
    cuenta = servicio.obtener_por_id(id)
    if "error" in cuenta:
        raise HTTPException(status_code=404, detail=cuenta["error"])
    return cuenta

@router.put("/{id}")
def actualizar_cuenta(id: str, info_cuenta: dict):
    return servicio.actualizar(id, info_cuenta)

@router.delete("/{id}")
def eliminar_cuenta(id: str):
    return servicio.eliminar(id)

@router.put("/{id}/saldo")
def actualizar_saldo(id: str, nuevo_saldo: float):
    resultado = servicio.actualizar_saldo(id, nuevo_saldo)
    if "error" in resultado:
        raise HTTPException(status_code=404, detail=resultado["error"])
    return resultado

@router.put("/{id_cuenta}/asignar-usuario/{id_usuario}")
async def asignar_usuario_a_cuenta(id_cuenta: str, id_usuario: str, request: Request):
    """Asigna un usuario a una cuenta."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Token de autorización faltante")

    print(f"📌 Recibida solicitud para asignar usuario {id_usuario} a cuenta {id_cuenta}")

    # Llamar a la lógica de Finanzas para asignar el usuario
    resultado = servicio.asignar_usuario_a_cuenta(id_cuenta, id_usuario, auth_header)

    return resultado



