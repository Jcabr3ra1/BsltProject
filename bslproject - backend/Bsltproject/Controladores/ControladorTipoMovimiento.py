from Repositorios.RepositorioTipoMovimiento import RepositorioTipoMovimiento
from Modelos.TipoMovimiento import TipoMovimiento

class ControladorTipoMovimiento():
    def __init__(self):
        self.repositorio = RepositorioTipoMovimiento()

    def obtenerTodos(self):
        return self.repositorio.findAll()

    def crear(self, data):
        nuevo = TipoMovimiento(data)
        return self.repositorio.save(nuevo)

    def obtenerPorId(self, id):
        tipo = self.repositorio.findById(id)
        return tipo if tipo else {"error": "TipoMovimiento no encontrado"}, 404

    def actualizar(self, id, data):
        tipoActual = self.repositorio.findById(id)
        if tipoActual:
            tipoActual["codigo_origen"] = data.get("codigo_origen", tipoActual["codigo_origen"])
            tipoActual["codigo_destino"] = data.get("codigo_destino", tipoActual["codigo_destino"])
            tipoActual["descripcion"] = data.get("descripcion", tipoActual["descripcion"])
            return self.repositorio.save(TipoMovimiento(tipoActual))
        return {"error": "TipoMovimiento no encontrado"}, 404

    def eliminar(self, id):
        return self.repositorio.delete(id)
