from Repositorios.RepositorioEstadoTransaccion import RepositorioEstadoTransaccion

class EstadoTransaccionServicio:
    def __init__(self):
        self.repositorio = RepositorioEstadoTransaccion()

    def obtener_todos(self):
        return self.repositorio.obtener_todos()

    def obtener_por_id(self, id):
        return self.repositorio.obtener_por_id(id)

    def crear(self, datos_estado):
        if "nombre" not in datos_estado or not datos_estado["nombre"]:
            return {"error": "El nombre del estado de transacción es obligatorio"}
        return self.repositorio.crear(datos_estado)

    def actualizar(self, id, datos_estado):
        if not id:
            return {"error": "El ID del estado de transacción es obligatorio"}
        return self.repositorio.actualizar(id, datos_estado)

    def eliminar(self, id):
        if not id:
            return {"error": "El ID del estado de transacción es obligatorio"}
        return self.repositorio.eliminar(id)

    def inicializar_estados_predeterminados(self):
        estados_predeterminados = [
            {
                "nombre": "PENDIENTE",
                "descripcion": "La transacción está pendiente de procesamiento",
                "activo": True
            },
            {
                "nombre": "COMPLETADA",
                "descripcion": "La transacción se ha completado correctamente",
                "activo": True
            },
            {
                "nombre": "RECHAZADA",
                "descripcion": "La transacción ha sido rechazada",
                "activo": True
            },
            {
                "nombre": "EN_PROCESO",
                "descripcion": "La transacción está siendo procesada",
                "activo": True
            },
            {
                "nombre": "CANCELADA",
                "descripcion": "La transacción ha sido cancelada",
                "activo": True
            }
        ]
        estados_existentes = self.obtener_todos()
        nombres_existentes = [estado["nombre"] for estado in estados_existentes]
        for estado in estados_predeterminados:
            if estado["nombre"] not in nombres_existentes:
                self.crear(estado)
        return {"mensaje": "Estados de transacción predeterminados inicializados correctamente"}
