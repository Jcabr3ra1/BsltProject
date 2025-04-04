from Modelos.AbstractModelo import AbstractModelo
from datetime import datetime

class Cuenta(AbstractModelo):
    def __init__(self, data):
        super().__init__(data)
        
        # Campos obligatorios con valores por defecto
        self.numero = data.get("numero", "")
        self.tipo = data.get("tipo", "CUENTA_CORRIENTE")
        self.saldo = data.get("saldo", 0.0)
        
        # Relaciones con otras tablas
        self.usuario_id = data.get("usuario_id", data.get("userId", None))
        self.id_bolsillo = data.get("id_bolsillo", None)
        
        # Campos adicionales
        self.nombre = data.get("nombre", "")
        self.color = data.get("color", "#1976D2")  # Color azul por defecto
        
        # Campos de auditoría
        self.createdAt = data.get("createdAt", datetime.now().isoformat())
        self.updatedAt = data.get("updatedAt", datetime.now().isoformat())
