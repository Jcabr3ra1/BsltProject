from Repositorios.RepositorioTipoMovimiento import RepositorioTipoMovimiento
from Modelos.TipoMovimiento import TipoMovimiento

class TipoMovimientoServicio:
    def __init__(self):
        self.repositorio = RepositorioTipoMovimiento()

    def obtener_todos(self):
        return self.repositorio.findAll()

    def crear(self, data):
        nuevo = TipoMovimiento(data)
        return self.repositorio.save(nuevo)

    def obtener_por_id(self, id):
        tipo = self.repositorio.findById(id)
        return tipo if tipo else {"error": "TipoMovimiento no encontrado"}, 404

    def actualizar(self, id, data):
        tipo_actual = self.repositorio.findById(id)
        if tipo_actual:
            tipo_actual["codigo_origen"] = data.get("codigo_origen", tipo_actual["codigo_origen"])
            tipo_actual["codigo_destino"] = data.get("codigo_destino", tipo_actual["codigo_destino"])
            tipo_actual["descripcion"] = data.get("descripcion", tipo_actual["descripcion"])
            return self.repositorio.save(TipoMovimiento(tipo_actual))
        return {"error": "TipoMovimiento no encontrado"}, 404

    def eliminar(self, id):
        return self.repositorio.delete(id)
