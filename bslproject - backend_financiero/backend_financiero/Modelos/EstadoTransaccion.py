from Modelos.AbstractModelo import AbstractModelo


class EstadoTransaccion(AbstractModelo):
    def __init__(self, data):
        super().__init__(data)  # Pasa el parámetro data al constructor padre

        # Puedes mantener los campos predeterminados si lo deseas
        # o confiar en la lógica de AbstractModelo para asignar todos los campos
        self.id = data.get("id", "")
        self.nombre = data.get("nombre", "")
        self.descripcion = data.get("descripcion", "")
        self.activo = data.get("activo", True)
