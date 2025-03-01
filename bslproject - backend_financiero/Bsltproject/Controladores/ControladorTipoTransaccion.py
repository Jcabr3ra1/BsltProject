from Repositorios.RepositorioTipoTransaccion import RepositorioTipoTransaccion
from Modelos.TipoTransaccion import TipoTransaccion

class ControladorTipoTransaccion():
    def __init__(self):
        self.repositorioTipoTransaccion = RepositorioTipoTransaccion()

    def obtenerTodos(self):
        return self.repositorioTipoTransaccion.findAll()

    def crear(self, data):
        nuevoTipo = TipoTransaccion(data)
        return self.repositorioTipoTransaccion.save(nuevoTipo)

    def obtenerPorId(self, id):
        tipo = self.repositorioTipoTransaccion.findById(id)
        if tipo:
            return tipo
        return {"error": "Tipo de transacción no encontrado"}, 404

    def actualizar(self, id, data):
        tipoExistente = self.repositorioTipoTransaccion.findById(id)
        if tipoExistente:
            tipoExistente["descripcion"] = data["descripcion"]
            return self.repositorioTipoTransaccion.save(tipoExistente)
        return {"error": "Tipo de transacción no encontrado"}, 404

    def eliminar(self, id):
        return self.repositorioTipoTransaccion.delete(id)
