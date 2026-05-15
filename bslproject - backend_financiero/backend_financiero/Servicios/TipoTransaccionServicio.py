from Repositorios.RepositorioTipoTransaccion import RepositorioTipoTransaccion
from Modelos.TipoTransaccion import TipoTransaccion

class TipoTransaccionServicio:
    def __init__(self):
        self.repositorioTipoTransaccion = RepositorioTipoTransaccion()

    def obtener_todos(self):
        return self.repositorioTipoTransaccion.findAll()

    def crear(self, data):
        nuevo_tipo = TipoTransaccion(data)
        return self.repositorioTipoTransaccion.save(nuevo_tipo)

    def obtener_por_id(self, id):
        tipo = self.repositorioTipoTransaccion.findById(id)
        return tipo if tipo else {"error": "Tipo de transacción no encontrado"}, 404

    def actualizar(self, id, data):
        tipo_actual = self.repositorioTipoTransaccion.findById(id)
        if tipo_actual:
            if "codigo" in data:
                tipo_actual["codigo"] = data["codigo"]
            if "descripcion" in data:
                tipo_actual["descripcion"] = data["descripcion"]
            return self.repositorioTipoTransaccion.save(TipoTransaccion(tipo_actual))
        return {"error": "Tipo de transacción no encontrado"}, 404

    def eliminar(self, id):
        return self.repositorioTipoTransaccion.delete(id)
