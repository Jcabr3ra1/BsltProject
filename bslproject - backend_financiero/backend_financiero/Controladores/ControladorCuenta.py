from fastapi import APIRouter, HTTPException, Request
from Servicios.CuentaServicio import CuentaServicio

router = APIRouter()  # Eliminamos el prefijo aquí ya que se agrega en main.py
servicio = CuentaServicio()

@router.get("/")
def obtener_cuentas():
    """Obtiene todas las cuentas disponibles en el sistema financiero"""
    return servicio.obtener_todas()

@router.post("/")
def crear_cuenta(info_cuenta: dict):
    """Crea una nueva cuenta en el sistema financiero"""
    print(f"Recibida solicitud para crear cuenta: {info_cuenta}")
    
    # Validar datos mínimos necesarios
    if "tipo" not in info_cuenta and "type" in info_cuenta:
        # Compatibilidad con frontend que puede enviar 'type' en lugar de 'tipo'
        info_cuenta["tipo"] = info_cuenta["type"]
    
    # Crear la cuenta
    resultado = servicio.crear(info_cuenta)
    
    # Verificar si el resultado es un error
    if isinstance(resultado, tuple) and len(resultado) > 1:
        raise HTTPException(status_code=resultado[1], detail=resultado[0])
        
    print(f"Cuenta creada exitosamente: {resultado}")
    return resultado

@router.get("/{id}")
def obtener_cuenta(id: str):
    """Obtiene una cuenta específica por su ID"""
    resultado = servicio.obtener_por_id(id)
    if isinstance(resultado, tuple) and len(resultado) > 1:
        raise HTTPException(status_code=resultado[1], detail=resultado[0])
    return resultado

@router.put("/{id}")
def actualizar_cuenta(id: str, info_cuenta: dict):
    """Actualiza una cuenta existente"""
    resultado = servicio.actualizar(id, info_cuenta)
    if isinstance(resultado, tuple) and len(resultado) > 1:
        raise HTTPException(status_code=resultado[1], detail=resultado[0])
    return resultado

@router.delete("/{id}")
def eliminar_cuenta(id: str):
    """Elimina una cuenta del sistema"""
    resultado = servicio.eliminar(id)
    return resultado

@router.get("/usuario/{id_usuario}")
def obtener_cuentas_por_usuario(id_usuario: str):
    """Obtiene todas las cuentas asociadas a un usuario específico"""
    print(f"Buscando cuentas para el usuario: {id_usuario}")
    resultado = servicio.obtener_por_usuario(id_usuario)
    if isinstance(resultado, tuple) and len(resultado) > 1 and "error" in resultado[0]:
        raise HTTPException(status_code=404, detail=resultado[0]["error"])
    return resultado

@router.put("/{id}/usuario/{id_usuario}")
def asignar_usuario_a_cuenta(id: str, id_usuario: str, request: Request = None):
    """Asigna un usuario a una cuenta"""
    # Obtener el token de autorización del request si está disponible
    auth_token = None
    if request:
        auth_header = request.headers.get("Authorization")
        if auth_header:
            auth_token = auth_header
    
    print(f"Asignando usuario {id_usuario} a cuenta {id}")
    resultado = servicio.asignar_usuario_a_cuenta(id, id_usuario, auth_token)
    
    if isinstance(resultado, tuple) and len(resultado) > 1:
        raise HTTPException(status_code=resultado[1], detail=resultado[0])
        
    print(f"Usuario asignado exitosamente a la cuenta")
    return resultado
