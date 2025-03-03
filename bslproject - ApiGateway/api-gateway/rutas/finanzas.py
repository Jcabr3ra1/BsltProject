import requests
from fastapi import APIRouter, Depends, HTTPException, Request
from middleware.autenticacion import verificar_token
import json

# Cargar configuración
with open("configuracion/config.json", "r") as archivo_config:
    configuracion = json.load(archivo_config)

URL_FINANZAS = configuracion["servicios"]["finanzas"]
URL_SEGURIDAD = configuracion["servicios"]["seguridad"]

router = APIRouter()

####################################### BOLSILLO #########################################################
### ✅ BOLSILLOS
@router.get("/finanzas/bolsillos")
async def obtener_bolsillos(token: str = Depends(verificar_token)):
    """Obtiene todos los bolsillos"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_FINANZAS}/bolsillos", headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.post("/finanzas/bolsillos")
async def crear_bolsillo(request: Request, token: str = Depends(verificar_token)):
    """Crea un nuevo bolsillo"""
    headers = {"Authorization": f"Bearer {token}"}
    data = await request.json()
    response = requests.post(f"{URL_FINANZAS}/bolsillos", json=data, headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.get("/finanzas/bolsillos/{id}")
async def obtener_bolsillo(id: str, token: str = Depends(verificar_token)):
    """Obtiene un bolsillo por su ID"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_FINANZAS}/bolsillos/{id}", headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.put("/finanzas/bolsillos/{id}")
async def actualizar_bolsillo(id: str, request: Request, token: str = Depends(verificar_token)):
    """Actualiza un bolsillo"""
    headers = {"Authorization": f"Bearer {token}"}
    data = await request.json()
    response = requests.put(f"{URL_FINANZAS}/bolsillos/{id}", json=data, headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.delete("/finanzas/bolsillos/{id}")
async def eliminar_bolsillo(id: str, token: str = Depends(verificar_token)):
    """Elimina un bolsillo"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(f"{URL_FINANZAS}/bolsillos/{id}", headers=headers)
    return {"mensaje": "Bolsillo eliminado correctamente"} if response.status_code == 204 else HTTPException(status_code=response.status_code)

@router.put("/finanzas/bolsillos/{id_bolsillo}/cuenta/{id_cuenta}")
async def asignar_cuenta_a_bolsillo(id_bolsillo: str, id_cuenta: str, token: str = Depends(verificar_token)):
    """Asigna una cuenta a un bolsillo"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(f"{URL_FINANZAS}/bolsillos/{id_bolsillo}/cuenta/{id_cuenta}", headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)
####################################### ESTADO #######################################
@router.get("/finanzas/cuentas")
async def obtener_cuentas(token: str = Depends(verificar_token)):
    """Obtiene todas las cuentas"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_FINANZAS}/cuentas", headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.post("/finanzas/cuentas")
async def crear_cuenta(request: Request, token: str = Depends(verificar_token)):
    """Crea una nueva cuenta"""
    headers = {"Authorization": f"Bearer {token}"}
    data = await request.json()
    response = requests.post(f"{URL_FINANZAS}/cuentas", json=data, headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.get("/finanzas/cuentas/{id}")
async def obtener_cuenta(id: str, token: str = Depends(verificar_token)):
    """Obtiene una cuenta por su ID"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_FINANZAS}/cuentas/{id}", headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.put("/finanzas/cuentas/{id}")
async def actualizar_cuenta(id: str, request: Request, token: str = Depends(verificar_token)):
    """Actualiza una cuenta"""
    headers = {"Authorization": f"Bearer {token}"}
    data = await request.json()
    response = requests.put(f"{URL_FINANZAS}/cuentas/{id}", json=data, headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.delete("/finanzas/cuentas/{id}")
async def eliminar_cuenta(id: str, token: str = Depends(verificar_token)):
    """Elimina una cuenta"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(f"{URL_FINANZAS}/cuentas/{id}", headers=headers)
    return {"mensaje": "Cuenta eliminada correctamente"} if response.status_code == 204 else HTTPException(status_code=response.status_code)

@router.put("/finanzas/cuentas/{id}/saldo")
async def actualizar_saldo_cuenta(id: str, request: Request, token: str = Depends(verificar_token)):
    """Actualiza el saldo de una cuenta"""
    headers = {"Authorization": f"Bearer {token}"}
    data = await request.json()
    response = requests.put(f"{URL_FINANZAS}/cuentas/{id}/saldo", json=data, headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.put("/finanzas/cuentas/{id_cuenta}/usuario/{id_usuario}")
async def asignar_usuario_a_cuenta(id_cuenta: str, id_usuario: str, token: str = Depends(verificar_token)):
    """Asigna un usuario a una cuenta"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(f"{URL_FINANZAS}/cuentas/{id_cuenta}/usuario/{id_usuario}", headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

####################################### TRANSACCIONES #######################################

@router.get("/finanzas/transacciones")
async def obtener_transacciones(token: str = Depends(verificar_token)):
    """Obtiene todas las transacciones"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_FINANZAS}/transacciones", headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.get("/finanzas/transacciones/{id}")
async def obtener_transaccion(id: str, token: str = Depends(verificar_token)):
    """Obtiene una transacción por su ID"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_FINANZAS}/transacciones/{id}", headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.post("/finanzas/transacciones")
async def crear_transaccion(request: Request, token: str = Depends(verificar_token)):
    """Crea una nueva transacción"""
    headers = {"Authorization": f"Bearer {token}"}
    data = await request.json()
    response = requests.post(f"{URL_FINANZAS}/transacciones", json=data, headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.delete("/finanzas/transacciones/{id}")
async def eliminar_transaccion(id: str, token: str = Depends(verificar_token)):
    """Elimina una transacción"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(f"{URL_FINANZAS}/transacciones/{id}", headers=headers)
    return {"mensaje": "Transacción eliminada correctamente"} if response.status_code == 204 else HTTPException(status_code=response.status_code)

####################################### TIPO MOVIMIENTO #######################################

@router.get("/finanzas/tipo_movimiento")
async def obtener_tipo_movimientos(token: str = Depends(verificar_token)):
    """Obtiene todos los tipos de movimiento"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_FINANZAS}/tipo_movimiento", headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.post("/finanzas/tipo_movimiento")
async def crear_tipo_movimiento(request: Request, token: str = Depends(verificar_token)):
    """Crea un nuevo tipo de movimiento"""
    headers = {"Authorization": f"Bearer {token}"}
    data = await request.json()
    response = requests.post(f"{URL_FINANZAS}/tipo_movimiento", json=data, headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.get("/finanzas/tipo_movimiento/{id}")
async def obtener_tipo_movimiento(id: str, token: str = Depends(verificar_token)):
    """Obtiene un tipo de movimiento por su ID"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_FINANZAS}/tipo_movimiento/{id}", headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.put("/finanzas/tipo_movimiento/{id}")
async def actualizar_tipo_movimiento(id: str, request: Request, token: str = Depends(verificar_token)):
    """Actualiza un tipo de movimiento"""
    headers = {"Authorization": f"Bearer {token}"}
    data = await request.json()
    response = requests.put(f"{URL_FINANZAS}/tipo_movimiento/{id}", json=data, headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.delete("/finanzas/tipo_movimiento/{id}")
async def eliminar_tipo_movimiento(id: str, token: str = Depends(verificar_token)):
    """Elimina un tipo de movimiento"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(f"{URL_FINANZAS}/tipo_movimiento/{id}", headers=headers)
    return {"mensaje": "Tipo de movimiento eliminado correctamente"} if response.status_code == 204 else HTTPException(status_code=response.status_code)

####################################### TIPO TRANSACCIÓN #######################################

@router.get("/finanzas/tipo_transaccion")
async def obtener_tipo_transacciones(token: str = Depends(verificar_token)):
    """Obtiene todos los tipos de transacción"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_FINANZAS}/tipo_transaccion", headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.post("/finanzas/tipo_transaccion")
async def crear_tipo_transaccion(request: Request, token: str = Depends(verificar_token)):
    """Crea un nuevo tipo de transacción"""
    headers = {"Authorization": f"Bearer {token}"}
    data = await request.json()
    response = requests.post(f"{URL_FINANZAS}/tipo_transaccion", json=data, headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.get("/finanzas/tipo_transaccion/{id}")
async def obtener_tipo_transaccion(id: str, token: str = Depends(verificar_token)):
    """Obtiene un tipo de transacción por su ID"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{URL_FINANZAS}/tipo_transaccion/{id}", headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.put("/finanzas/tipo_transaccion/{id}")
async def actualizar_tipo_transaccion(id: str, request: Request, token: str = Depends(verificar_token)):
    """Actualiza un tipo de transacción"""
    headers = {"Authorization": f"Bearer {token}"}
    data = await request.json()
    response = requests.put(f"{URL_FINANZAS}/tipo_transaccion/{id}", json=data, headers=headers)
    return response.json() if response.status_code == 200 else HTTPException(status_code=response.status_code)

@router.delete("/finanzas/tipo_transaccion/{id}")
async def eliminar_tipo_transaccion(id: str, token: str = Depends(verificar_token)):
    """Elimina un tipo de transacción"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.delete(f"{URL_FINANZAS}/tipo_transaccion/{id}", headers=headers)
    return {"mensaje": "Tipo de transacción eliminado correctamente"} if response.status_code == 204 else HTTPException(status_code=response.status_code)