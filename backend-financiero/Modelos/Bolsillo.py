from Modelos.AbstractModelo import AbstractModelo

class Bolsillo(AbstractModelo):
    def __init__(self, data):
        self.nombre = data.get("nombre", "")
        self.saldo = data.get("saldo", 0.0)
        self.color = data.get("color", "#1976D2")
        self.id_cuenta = data.get("id_cuenta", None)
        super().__init__(data)
