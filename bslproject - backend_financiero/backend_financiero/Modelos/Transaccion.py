from Modelos.AbstractModelo import AbstractModelo
from datetime import datetime

class Transaccion(AbstractModelo):
    def __init__(self, data):
        super().__init__()
        
        # Campos obligatorios
        self.descripcion = data.get("descripcion", "")
        self.fecha_transaccion = data.get("fecha_transaccion", datetime.now().isoformat())
        self.monto = data.get("monto", 0.0)
        
        # Relaciones con otras tablas (IDs)
        self.id_tipo_movimiento = data.get("id_tipo_movimiento", None)
        self.id_tipo_transaccion = data.get("id_tipo_transaccion", None)
        
        # Relaciones con cuentas
        self.id_cuenta_origen = data.get("id_cuenta_origen", None)
        self.id_cuenta_destino = data.get("id_cuenta_destino", None)
        
        # Relaciones con bolsillos
        self.id_bolsillo_origen = data.get("id_bolsillo_origen", None)
        self.id_bolsillo_destino = data.get("id_bolsillo_destino", None)
