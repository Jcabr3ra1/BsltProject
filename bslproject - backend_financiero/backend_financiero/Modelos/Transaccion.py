from Modelos.AbstractModelo import AbstractModelo
from datetime import datetime

class Transaccion(AbstractModelo):
    def __init__(self, data):
        self.descripcion = data.get("descripcion", "")
        self.fecha_transaccion = data.get("fecha_transaccion", datetime.now().isoformat())
        self.monto = data.get("monto", 0.0)
        self.estado = data.get("estado", "PENDIENTE")
        self.id_usuario = data.get("id_usuario", None)
        self.id_tipo_movimiento = data.get("id_tipo_movimiento", None)
        self.id_tipo_transaccion = data.get("id_tipo_transaccion", None)
        self.id_cuenta_origen = data.get("id_cuenta_origen", None)
        self.id_cuenta_destino = data.get("id_cuenta_destino", None)
        self.id_bolsillo_origen = data.get("id_bolsillo_origen", None)
        self.id_bolsillo_destino = data.get("id_bolsillo_destino", None)
        self.uuid_transaccion = data.get("uuid_transaccion")
        super().__init__(data)
