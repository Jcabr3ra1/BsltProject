from Modelos.AbstractModelo import AbstractModelo


class TipoTransaccion(AbstractModelo):
    def __init__(self, data):
        # Campos básicos con valores por defecto
        self.codigo = data.get("codigo", "")
        self.descripcion = data.get("descripcion", "")

        # Llamar al constructor padre
        super().__init__(data)