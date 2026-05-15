from Repositorios.InterfaceRepositorio import InterfaceRepositorio
from Modelos.EstadoTransaccion import EstadoTransaccion
from bson import ObjectId

class RepositorioEstadoTransaccion(InterfaceRepositorio):
    def __init__(self):
        super().__init__()
        self.baseDatos = self.baseDatos
        self.coleccion = "estados_transaccion"

    def obtener_todos(self):
        estados = self.baseDatos[self.coleccion].find()
        estados_list = []
        for estado in estados:
            estado["id"] = str(estado["_id"])
            del estado["_id"]
            estados_list.append(estado)
        return estados_list

    def obtener_por_id(self, id):
        try:
            estado = self.baseDatos[self.coleccion].find_one({"_id": ObjectId(id)})
            if estado:
                estado["id"] = str(estado["_id"])
                del estado["_id"]
                return estado
            else:
                return {"error": f"Estado de transacción con ID {id} no encontrado"}
        except Exception as e:
            return {"error": f"Error al obtener estado de transacción: {str(e)}"}

    def crear(self, datos_estado):
        try:
            estado_existente = self.baseDatos[self.coleccion].find_one({"nombre": datos_estado["nombre"]})
            if estado_existente:
                return {"error": f"Ya existe un estado de transacción con el nombre '{datos_estado['nombre']}'"}
            estado = EstadoTransaccion(datos_estado)
            resultado = self.baseDatos[self.coleccion].insert_one(estado.__dict__)
            estado_creado = self.obtener_por_id(str(resultado.inserted_id))
            return estado_creado
        except Exception as e:
            return {"error": f"Error al crear estado de transacción: {str(e)}"}

    def actualizar(self, id, datos_estado):
        try:
            estado_actual = self.obtener_por_id(id)
            if "error" in estado_actual:
                return estado_actual
            if "nombre" in datos_estado:
                estado_existente = self.baseDatos[self.coleccion].find_one({
                    "nombre": datos_estado["nombre"],
                    "_id": {"$ne": ObjectId(id)}
                })
                if estado_existente:
                    return {"error": f"Ya existe otro estado de transacción con el nombre '{datos_estado['nombre']}'"}
            resultado = self.baseDatos[self.coleccion].update_one(
                {"_id": ObjectId(id)},
                {"$set": datos_estado}
            )
            if resultado.modified_count > 0:
                return self.obtener_por_id(id)
            else:
                return {"error": "No se realizaron cambios en el estado de transacción"}
        except Exception as e:
            return {"error": f"Error al actualizar estado de transacción: {str(e)}"}

    def eliminar(self, id):
        try:
            estado = self.obtener_por_id(id)
            if "error" in estado:
                return estado
            resultado = self.baseDatos[self.coleccion].delete_one({"_id": ObjectId(id)})
            if resultado.deleted_count > 0:
                return {"mensaje": f"Estado de transacción con ID {id} eliminado correctamente"}
            else:
                return {"error": f"No se pudo eliminar el estado de transacción con ID {id}"}
        except Exception as e:
            return {"error": f"Error al eliminar estado de transacción: {str(e)}"}
