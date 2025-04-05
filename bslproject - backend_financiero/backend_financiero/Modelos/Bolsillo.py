from Modelos.AbstractModelo import AbstractModelo


class Bolsillo(AbstractModelo):
    def __init__(self, data):
        # Campos básicos con valores por defecto
        self.nombre = data.get("nombre", "")
        self.saldo = data.get("saldo", 0.0)
        self.color = data.get("color", "#1976D2")  # Color azul por defecto
        self.id_cuenta = data.get("id_cuenta", None)

        # Llamar al constructor padre
        super().__init__(data)