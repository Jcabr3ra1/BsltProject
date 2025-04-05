from Modelos.AbstractModelo import AbstractModelo

class EstadoTransaccion(AbstractModelo):
    def __init__(self, data):
        super().__init__()
        
        # Campos obligatorios
        self.id = data.get("id", "")
        self.nombre = data.get("nombre", "")
        self.descripcion = data.get("descripcion", "")
        self.activo = data.get("activo", True)
