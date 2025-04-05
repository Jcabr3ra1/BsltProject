from Repositorios.RepositorioTransaccion import RepositorioTransaccion
from Repositorios.RepositorioCuenta import RepositorioCuenta
from Repositorios.RepositorioBolsillo import RepositorioBolsillo
from Repositorios.RepositorioTipoMovimiento import RepositorioTipoMovimiento
from Modelos.Transaccion import Transaccion
from Modelos.Cuenta import Cuenta
from Modelos.Bolsillo import Bolsillo

class TransaccionServicio:
    def __init__(self):
        self.repositorioTransaccion = RepositorioTransaccion()
        self.repositorioCuenta = RepositorioCuenta()
        self.repositorioBolsillo = RepositorioBolsillo()
        self.repositorioTipoMovimiento = RepositorioTipoMovimiento()

    def obtener_todas(self):
        transacciones = self.repositorioTransaccion.findAll()
        print("Transacciones encontradas:", transacciones)  # <-- Agrega esto
        return transacciones

    def obtener_por_id(self, id):
        transaccion = self.repositorioTransaccion.findById(id)
        if transaccion:
            # Enriquecer la transacción con información relacionada
            transaccion_enriquecida = self._enriquecer_transaccion(transaccion)
            return transaccion_enriquecida
        return {"error": "Transacción no encontrada"}, 404

    def obtener_por_usuario(self, id_usuario):
        """
        Obtiene todas las transacciones asociadas a un usuario específico.

        Args:
            id_usuario (str): ID del usuario para filtrar las transacciones

        Returns:
            list: Lista de transacciones del usuario
        """
        print(f"Servicio: Iniciando búsqueda de transacciones para el usuario: {id_usuario}")
        print(f"Servicio: Tipo del ID de usuario: {type(id_usuario)}")

        # Primero obtenemos todas las cuentas del usuario
        print(f"Servicio: Consultando cuentas con usuario_id={id_usuario}")
        cuentas_usuario = self.repositorioCuenta.query({"usuario_id": id_usuario})

        # Intentamos con diferentes campos en caso de inconsistencias
        if not cuentas_usuario:
            print(f"Servicio: No se encontraron cuentas con usuario_id, intentando con userId")
            cuentas_usuario = self.repositorioCuenta.query({"userId": id_usuario})

        if not cuentas_usuario:
            print(f"Servicio: No se encontraron cuentas con userId, intentando con id_usuario")
            cuentas_usuario = self.repositorioCuenta.query({"id_usuario": id_usuario})

        if not cuentas_usuario:
            print(f"Servicio: Definitivamente no se encontraron cuentas para el usuario {id_usuario}")
            # Imprimir todas las cuentas para depuración
            todas_cuentas = self.repositorioCuenta.findAll()
            print(f"Servicio: Total de cuentas en la BD: {len(todas_cuentas)}")
            for cuenta in todas_cuentas:
                print(
                    f"Cuenta ID: {cuenta.get('_id')}, usuario_id: {cuenta.get('usuario_id')}, userId: {cuenta.get('userId')}")
            return []

        print(f"Servicio: Cuentas encontradas para el usuario {id_usuario}: {len(cuentas_usuario)}")
        for cuenta in cuentas_usuario:
            print(f"Servicio: Cuenta encontrada - ID: {cuenta.get('_id')}, Saldo: {cuenta.get('saldo')}")

        # Obtenemos todas las transacciones
        todas_transacciones = self.repositorioTransaccion.findAll()
        print(f"Servicio: Total de transacciones en la BD: {len(todas_transacciones)}")

        # Filtramos las transacciones que involucran las cuentas del usuario
        transacciones_usuario = []
        ids_cuentas = [cuenta["_id"] for cuenta in cuentas_usuario]
        print(f"Servicio: IDs de cuentas del usuario: {ids_cuentas}")

        # También obtenemos los bolsillos asociados a las cuentas del usuario
        bolsillos_usuario = []
        for cuenta in cuentas_usuario:
            if cuenta.get("id_bolsillo"):
                bolsillo = self.repositorioBolsillo.findById(cuenta["id_bolsillo"])
                if bolsillo:
                    bolsillos_usuario.append(bolsillo)
                    print(f"Servicio: Bolsillo encontrado - ID: {bolsillo.get('_id')}, Saldo: {bolsillo.get('saldo')}")

        ids_bolsillos = [bolsillo["_id"] for bolsillo in bolsillos_usuario]
        print(f"Servicio: IDs de bolsillos del usuario: {ids_bolsillos}")

        for transaccion in todas_transacciones:
            # Verificamos si la cuenta origen o destino pertenece al usuario
            cuenta_origen_match = "id_cuenta_origen" in transaccion and transaccion["id_cuenta_origen"] in ids_cuentas
            cuenta_destino_match = "id_cuenta_destino" in transaccion and transaccion[
                "id_cuenta_destino"] in ids_cuentas
            bolsillo_origen_match = "id_bolsillo_origen" in transaccion and transaccion[
                "id_bolsillo_origen"] in ids_bolsillos
            bolsillo_destino_match = "id_bolsillo_destino" in transaccion and transaccion[
                "id_bolsillo_destino"] in ids_bolsillos

            if cuenta_origen_match or cuenta_destino_match or bolsillo_origen_match or bolsillo_destino_match:
                print(
                    f"Servicio: Transacción encontrada - ID: {transaccion.get('_id')}, Monto: {transaccion.get('monto')}")
                # Enriquecer la transacción con información relacionada
                transaccion_enriquecida = self._enriquecer_transaccion(transaccion)
                transacciones_usuario.append(transaccion_enriquecida)

        print(
            f"Servicio: Total de transacciones encontradas para el usuario {id_usuario}: {len(transacciones_usuario)}")
        return transacciones_usuario
        
    def obtener_proximos_pagos(self, id_usuario):
        """
        Obtiene los próximos pagos programados para un usuario específico.
        
        Args:
            id_usuario (str): ID del usuario para filtrar los pagos
            
        Returns:
            list: Lista de próximos pagos del usuario
        """
        print(f"Servicio: Buscando próximos pagos para el usuario: {id_usuario}")
        
        # Obtenemos todas las transacciones del usuario
        transacciones_usuario = self.obtener_por_usuario(id_usuario)
        
        # Filtramos solo las transacciones que son pagos programados y están pendientes
        proximos_pagos = []
        for transaccion in transacciones_usuario:
            # Verificamos si es un pago programado (podemos usar algún campo específico)
            if transaccion.get("es_pago_programado", False) and transaccion.get("estado", "") == "PENDIENTE":
                proximos_pagos.append(transaccion)
        
        print(f"Próximos pagos encontrados para el usuario {id_usuario}: {len(proximos_pagos)}")
        return proximos_pagos

    def _enriquecer_transaccion(self, transaccion):
        """
        Enriquece una transacción con información de las entidades relacionadas,
        incluyendo información de usuarios.

        Args:
            transaccion (dict): Transacción a enriquecer

        Returns:
            dict: Transacción enriquecida con información de cuentas, bolsillos, tipos y usuarios
        """
        # Crear una copia para no modificar el original
        transaccion_enriquecida = transaccion.copy()

        # Añadir información de tipo de movimiento
        if "id_tipo_movimiento" in transaccion and transaccion["id_tipo_movimiento"]:
            tipo_movimiento = self.repositorioTipoMovimiento.findById(transaccion["id_tipo_movimiento"])
            if tipo_movimiento:
                transaccion_enriquecida["tipo_movimiento"] = tipo_movimiento

        # Añadir información de cuenta origen y su usuario
        if "id_cuenta_origen" in transaccion and transaccion["id_cuenta_origen"]:
            cuenta_origen = self.repositorioCuenta.findById(transaccion["id_cuenta_origen"])
            if cuenta_origen:
                transaccion_enriquecida["cuenta_origen"] = cuenta_origen

                # Agregar información del usuario de la cuenta origen
                if "usuario_id" in cuenta_origen and cuenta_origen["usuario_id"]:
                    usuario_origen = self.repositorioUsuario.obtener_por_id(cuenta_origen["usuario_id"])
                    if usuario_origen:
                        transaccion_enriquecida["usuario_origen"] = usuario_origen

        # Añadir información de cuenta destino y su usuario
        if "id_cuenta_destino" in transaccion and transaccion["id_cuenta_destino"]:
            cuenta_destino = self.repositorioCuenta.findById(transaccion["id_cuenta_destino"])
            if cuenta_destino:
                transaccion_enriquecida["cuenta_destino"] = cuenta_destino

                # Agregar información del usuario de la cuenta destino
                if "usuario_id" in cuenta_destino and cuenta_destino["usuario_id"]:
                    usuario_destino = self.repositorioUsuario.obtener_por_id(cuenta_destino["usuario_id"])
                    if usuario_destino:
                        transaccion_enriquecida["usuario_destino"] = usuario_destino

        # Añadir información de bolsillo origen
        if "id_bolsillo_origen" in transaccion and transaccion["id_bolsillo_origen"]:
            bolsillo_origen = self.repositorioBolsillo.findById(transaccion["id_bolsillo_origen"])
            if bolsillo_origen:
                transaccion_enriquecida["bolsillo_origen"] = bolsillo_origen

        # Añadir información de bolsillo destino
        if "id_bolsillo_destino" in transaccion and transaccion["id_bolsillo_destino"]:
            bolsillo_destino = self.repositorioBolsillo.findById(transaccion["id_bolsillo_destino"])
            if bolsillo_destino:
                transaccion_enriquecida["bolsillo_destino"] = bolsillo_destino

        return transaccion_enriquecida

    def crear(self, infoTransaccion):
        nuevaTransaccion = Transaccion(infoTransaccion)
        monto = infoTransaccion["monto"]

        # 🔹 **Obtener tipo de movimiento**
        tipo_movimiento = self.repositorioTipoMovimiento.findById(infoTransaccion["id_tipo_movimiento"])
        if not tipo_movimiento:
            return {"error": "Tipo de movimiento no válido"}, 400

        # 🔹 Convertimos a mayúsculas para evitar errores por diferencias en minúsculas/mayúsculas
        origen = tipo_movimiento["codigo_origen"].upper()
        destino = tipo_movimiento["codigo_destino"].upper()

        """
        🔹 Verificar el tipo de transacción y actualizar saldos en consecuencia
        """

        if origen == "ACCOUNT" and destino == "ACCOUNT":  # Cambiamos "CUENTA" por "ACCOUNT"
            return self._transferenciaCuentaCuenta(infoTransaccion, monto)

        if origen == "ACCOUNT" and destino == "WALLET":  # También ajustamos "CUENTA" por "ACCOUNT"
            return self._transferenciaCuentaBolsillo(infoTransaccion, monto)

        if origen == "WALLET" and destino == "ACCOUNT":
            return self._retiroBolsilloCuenta(infoTransaccion, monto)

        if origen == "BANK" and destino == "ACCOUNT":
            return self._consignacionBancoCuenta(infoTransaccion, monto)

        if origen == "BANK" and destino == "WALLET":
            return self._consignacionBancoBolsillo(infoTransaccion, monto)

        if origen == "ACCOUNT" and destino == "BANK":
            return self._retiroCuentaBanco(infoTransaccion, monto)

        return {"error": "Tipo de movimiento no reconocido"}, 400

    """
    🔹 Métodos internos para manejar cada tipo de transacción
    """

    def _transferenciaCuentaCuenta(self, infoTransaccion, monto):
        cuenta_origen_data = self.repositorioCuenta.findById(infoTransaccion["id_cuenta_origen"])
        cuenta_destino_data = self.repositorioCuenta.findById(infoTransaccion["id_cuenta_destino"])

        if not cuenta_origen_data or not cuenta_destino_data:
            return {"error": "Cuenta origen o destino no encontrada"}, 404

        if cuenta_origen_data["saldo"] < monto:
            return {"error": "Saldo insuficiente en la cuenta origen"}, 400

        cuenta_origen = Cuenta(cuenta_origen_data)
        cuenta_destino = Cuenta(cuenta_destino_data)

        cuenta_origen.saldo -= monto
        cuenta_destino.saldo += monto

        self.repositorioCuenta.save(cuenta_origen)
        self.repositorioCuenta.save(cuenta_destino)

        print("✅ Transacción que se intentará guardar:", infoTransaccion)  # <-- Debug print
        nueva_transaccion = Transaccion(infoTransaccion)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)

        print("✅ Resultado de guardar transacción:", resultado)  # <-- Debug print

        return resultado

    def _transferenciaCuentaBolsillo(self, infoTransaccion, monto):
        cuenta_origen_data = self.repositorioCuenta.findById(infoTransaccion["id_cuenta_origen"])
        cuenta_origen = Cuenta(cuenta_origen_data) if cuenta_origen_data else None
        bolsillo_destino_data = self.repositorioBolsillo.findById(infoTransaccion["id_bolsillo_destino"])
        bolsillo_destino = Bolsillo(bolsillo_destino_data) if bolsillo_destino_data else None

        if not cuenta_origen or not bolsillo_destino:
            return {"error": "Cuenta origen o bolsillo destino no encontrado"}, 404

        # ✅ Corrección: Usar atributos del objeto en lugar de índices de diccionario
        if cuenta_origen.saldo < monto:
            return {"error": "Saldo insuficiente en la cuenta"}, 400

        # ✅ Corrección: Usar atributos en lugar de índices
        cuenta_origen.saldo -= monto
        bolsillo_destino.saldo += monto

        # ✅ Guardar cambios en la base de datos
        self.repositorioCuenta.save(cuenta_origen)
        self.repositorioBolsillo.save(bolsillo_destino)

        print("✅ Guardando transacción de cuenta a bolsillo:", infoTransaccion)  # Debug print
        nueva_transaccion = Transaccion(infoTransaccion)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)
        print("✅ Transacción guardada:", resultado)  # Debug print

        return resultado

    def _retiroCuentaBanco(self, infoTransaccion, monto):
        cuenta_origen_data = self.repositorioCuenta.findById(infoTransaccion["id_cuenta_origen"])

        if not cuenta_origen_data:
            return {"error": "Cuenta origen no encontrada"}, 404

        # ✅ Convertimos el diccionario en una instancia de Transaccion antes de modificarlo
        cuenta_origen = Cuenta(cuenta_origen_data)

        if cuenta_origen.saldo < monto:
            return {"error": "Saldo insuficiente en la cuenta"}, 400

        cuenta_origen.saldo -= monto

        # ✅ Guardar la cuenta como objeto, no como diccionario
        self.repositorioCuenta.save(cuenta_origen)

        print("✅ Guardando transacción de retiro de cuenta a banco:", infoTransaccion)
        nueva_transaccion = Transaccion(infoTransaccion)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)
        print("✅ Transacción guardada:", resultado)

        return resultado

    def _consignacionBancoCuenta(self, infoTransaccion, monto):
        if "id_cuenta_destino" not in infoTransaccion:
            return {"error": "Falta id_cuenta_destino en la transacción"}, 400

        cuenta_destino_data = self.repositorioCuenta.findById(infoTransaccion["id_cuenta_destino"])
        if not cuenta_destino_data:
            return {"error": "Cuenta destino no encontrada"}, 404

        cuenta_destino = Cuenta(cuenta_destino_data)
        cuenta_destino.saldo += monto

        self.repositorioCuenta.save(cuenta_destino)

        nueva_transaccion = Transaccion(infoTransaccion)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)

        return resultado

    def _consignacionBancoBolsillo(self, infoTransaccion, monto):
        """
        Maneja la consignación desde el banco a un bolsillo.
        """
        # Verificar que el bolsillo destino existe
        bolsillo_destino_data = self.repositorioBolsillo.findById(infoTransaccion["id_bolsillo_destino"])
        if not bolsillo_destino_data:
            return {"error": "Bolsillo destino no encontrado"}, 404

        # Convertir el diccionario en un objeto Bolsillo
        bolsillo_destino = Bolsillo(bolsillo_destino_data)

        # Aumentar saldo en el bolsillo destino
        bolsillo_destino.saldo += monto

        # Guardar el nuevo saldo en la base de datos
        self.repositorioBolsillo.save(bolsillo_destino)

        # Crear y guardar la transacción
        nueva_transaccion = Transaccion(infoTransaccion)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)

        print("✅ Transacción de consignación desde banco a bolsillo guardada:", resultado)
        return resultado

    def _retiroCuentaBanco(self, infoTransaccion, monto):
        cuenta_origen_data = self.repositorioCuenta.findById(infoTransaccion["id_cuenta_origen"])

        if not cuenta_origen_data:
            return {"error": "Cuenta origen no encontrada"}, 404

        # ✅ Convertimos el diccionario en una instancia de Transaccion antes de modificarlo
        cuenta_origen = Cuenta(cuenta_origen_data)

        if cuenta_origen.saldo < monto:
            return {"error": "Saldo insuficiente en la cuenta"}, 400

        cuenta_origen.saldo -= monto

        # ✅ Guardar la cuenta como objeto, no como diccionario
        self.repositorioCuenta.save(cuenta_origen)

        print("✅ Guardando transacción de retiro de cuenta a banco:", infoTransaccion)
        nueva_transaccion = Transaccion(infoTransaccion)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)
        print("✅ Transacción guardada:", resultado)

        return resultado

    def _retiroBolsilloCuenta(self, infoTransaccion, monto):
        bolsillo_origen_data = self.repositorioBolsillo.findById(infoTransaccion["id_bolsillo_origen"])
        cuenta_destino_data = self.repositorioCuenta.findById(infoTransaccion["id_cuenta_destino"])

        if not bolsillo_origen_data or not cuenta_destino_data:
            return {"error": "Bolsillo origen o cuenta destino no encontrada"}, 404

        bolsillo_origen = Bolsillo(bolsillo_origen_data)
        cuenta_destino = Cuenta(cuenta_destino_data)

        if bolsillo_origen.saldo < monto:
            return {"error": "Saldo insuficiente en el bolsillo"}, 400

        # 🔹 Actualizar saldos
        bolsillo_origen.saldo -= monto
        cuenta_destino.saldo += monto

        # 🔹 Guardar cambios en la base de datos
        self.repositorioBolsillo.save(bolsillo_origen)
        self.repositorioCuenta.save(cuenta_destino)

        # 🔹 Guardar la transacción en la base de datos
        print("✅ Guardando transacción de retiro de bolsillo a cuenta:", infoTransaccion)
        nueva_transaccion = Transaccion(infoTransaccion)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)
        print("✅ Transacción guardada:", resultado)

        return resultado

    """
    🔹 Actualizar una transacción
    """

    def actualizar(self, id, infoTransaccion):
        transaccion_actual = self.repositorioTransaccion.findById(id)

        if not transaccion_actual:
            return {"error": "Transacción no encontrada"}, 404

        # Aseguramos que transaccion_actual es un objeto de Transaccion
        if isinstance(transaccion_actual, dict):
            transaccion_actual = Transaccion(transaccion_actual)

        # Solo permitir cambiar descripción y fecha_transaccion
        transaccion_actual.descripcion = infoTransaccion.get("descripcion", transaccion_actual.descripcion)
        transaccion_actual.fecha_transaccion = infoTransaccion.get("fecha_transaccion",
                                                                   transaccion_actual.fecha_transaccion)

        return self.repositorioTransaccion.save(transaccion_actual)

    """
    🔹 Eliminar una transacción
    """

    def anular(self, id):
        """
        Cambia el estado de una transacción a 'ANULADA'.

        Args:
            id (str): ID de la transacción a anular

        Returns:
            dict: Transacción actualizada o mensaje de error
        """
        print(f"Intentando anular transacción con ID: {id}")

        # Verificar que la transacción existe
        transaccion_data = self.repositorioTransaccion.findById(id)
        if not transaccion_data:
            print(f"Error: Transacción con ID {id} no encontrada")
            return {"error": "Transacción no encontrada"}, 404

        print(f"Transacción encontrada: {transaccion_data}")

        # Verificar si ya está anulada
        if "estado" in transaccion_data and transaccion_data["estado"] == "ANULADA":
            return {"message": "La transacción ya estaba anulada", "transaccion": transaccion_data}

        # Convertir el diccionario en una instancia de Transaccion
        transaccion = Transaccion(transaccion_data)

        # Actualizar el estado
        transaccion.estado = "ANULADA"

        # Guardar la transacción actualizada
        resultado = self.repositorioTransaccion.save(transaccion)
        print(f"Resultado de anular transacción: {resultado}")

        return resultado
