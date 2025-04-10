from Modelos.AbstractModelo import AbstractModelo
from datetime import datetime


class Transaccion(AbstractModelo):
    def __init__(self, data):
        # Aseguramos que todos los campos importantes estén presentes
        self.descripcion = data.get("descripcion", "")
        self.fecha_transaccion = data.get("fecha_transaccion", datetime.now().isoformat())
        self.monto = data.get("monto", 0.0)
        self.estado = data.get("estado", "PENDIENTE")  # Añadir campo de estado

        # Añadir campo para el usuario que realiza la transacción
        self.id_usuario = data.get("id_usuario", None)

        # Relaciones con otras tablas (IDs)
        self.id_tipo_movimiento = data.get("id_tipo_movimiento", None)
        self.id_tipo_transaccion = data.get("id_tipo_transaccion", None)

        # Relaciones con cuentas
        self.id_cuenta_origen = data.get("id_cuenta_origen", None)
        self.id_cuenta_destino = data.get("id_cuenta_destino", None)

        # Relaciones con bolsillos
        self.id_bolsillo_origen = data.get("id_bolsillo_origen", None)
        self.id_bolsillo_destino = data.get("id_bolsillo_destino", None)

        # Llamar al constructor padre al final
        super().__init__(data)