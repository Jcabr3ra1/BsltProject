from Modelos.AbstractModelo import AbstractModelo
from datetime import datetime

class Cuenta(AbstractModelo):
    def __init__(self, data):
        super().__init__(data)
        self.tipo = data.get("tipo", "CUENTA_CORRIENTE")
        self.saldo = data.get("saldo", 0.0)
        self.usuario_id = data.get("usuario_id", data.get("userId", None))
        self.id_bolsillo = data.get("id_bolsillo", None)
        self.nombre = data.get("nombre", "")
        self.color = data.get("color", "#1976D2")
        self.createdAt = data.get("createdAt", datetime.now().isoformat())
        self.updatedAt = data.get("updatedAt", datetime.now().isoformat())
