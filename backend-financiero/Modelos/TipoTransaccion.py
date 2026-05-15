from Modelos.AbstractModelo import AbstractModelo

class TipoTransaccion(AbstractModelo):
    def __init__(self, data):
        self.codigo = data.get("codigo", "")
        self.descripcion = data.get("descripcion", "")
        super().__init__(data)
