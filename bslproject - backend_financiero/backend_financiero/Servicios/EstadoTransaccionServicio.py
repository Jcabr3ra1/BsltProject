from Repositorios.RepositorioEstadoTransaccion import RepositorioEstadoTransaccion

class EstadoTransaccionServicio:
    def __init__(self):
        self.repositorio = RepositorioEstadoTransaccion()
    
    def obtener_todos(self):
        """
        Obtiene todos los estados de transacción
        """
        return self.repositorio.obtener_todos()
    
    def obtener_por_id(self, id):
        """
        Obtiene un estado de transacción por su ID
        """
        return self.repositorio.obtener_por_id(id)
    
    def crear(self, datos_estado):
        """
        Crea un nuevo estado de transacción
        """
        # Validar datos obligatorios
        if "nombre" not in datos_estado or not datos_estado["nombre"]:
            return {"error": "El nombre del estado de transacción es obligatorio"}
        
        return self.repositorio.crear(datos_estado)
    
    def actualizar(self, id, datos_estado):
        """
        Actualiza un estado de transacción existente
        """
        # Validar que el ID sea válido
        if not id:
            return {"error": "El ID del estado de transacción es obligatorio"}
        
        return self.repositorio.actualizar(id, datos_estado)
    
    def eliminar(self, id):
        """
        Elimina un estado de transacción
        """
        # Validar que el ID sea válido
        if not id:
            return {"error": "El ID del estado de transacción es obligatorio"}
        
        return self.repositorio.eliminar(id)
    
    def inicializar_estados_predeterminados(self):
        """
        Inicializa los estados de transacción predeterminados si no existen
        """
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
        
        # Obtener todos los estados existentes
        estados_existentes = self.obtener_todos()
        nombres_existentes = [estado["nombre"] for estado in estados_existentes]
        
        # Crear los estados predeterminados que no existen
        for estado in estados_predeterminados:
            if estado["nombre"] not in nombres_existentes:
                self.crear(estado)
        
        return {"mensaje": "Estados de transacción predeterminados inicializados correctamente"}
