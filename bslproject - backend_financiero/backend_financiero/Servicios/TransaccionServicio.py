from Repositorios.RepositorioTransaccion import RepositorioTransaccion
from Repositorios.RepositorioCuenta import RepositorioCuenta
from Repositorios.RepositorioBolsillo import RepositorioBolsillo
from Repositorios.RepositorioTipoMovimiento import RepositorioTipoMovimiento
from Repositorios.RepositorioTipoTransaccion import RepositorioTipoTransaccion
from Modelos.Transaccion import Transaccion
from Modelos.Cuenta import Cuenta
from Modelos.Bolsillo import Bolsillo

class TransaccionServicio:
    def __init__(self):
        self.repositorioTransaccion = RepositorioTransaccion()
        self.repositorioCuenta = RepositorioCuenta()
        self.repositorioBolsillo = RepositorioBolsillo()
        self.repositorioTipoMovimiento = RepositorioTipoMovimiento()
        self.repositorioTipoTransaccion = RepositorioTipoTransaccion()

    def obtener_todas(self):
        transacciones = self.repositorioTransaccion.findAll()
        print("Transacciones encontradas:", transacciones)  # <-- Agrega esto
        return transacciones

    def obtener_por_id(self, id):
        transaccion = self.repositorioTransaccion.findById(id)
        if transaccion:
            return transaccion
        return {"error": "Transacción no encontrada"}, 404

    def eliminar_permanente(self, id):
        """
        Elimina permanentemente una transacción de la base de datos.

        Args:
            id (str): ID de la transacción a eliminar

        Returns:
            dict: Mensaje de confirmación o error
        """
        print(f"Eliminando permanentemente la transacción con ID: {id}")

        # Verificar que la transacción existe
        transaccion_data = self.repositorioTransaccion.findById(id)
        if not transaccion_data:
            print(f"Error: Transacción con ID {id} no encontrada")
            return {"error": "Transacción no encontrada"}, 404

        print(f"Transacción encontrada: {transaccion_data}")

        # Guardar una copia de la transacción para retornarla en la respuesta
        transaccion_eliminada = transaccion_data.copy()
        
        try:
            # Eliminar la transacción de la base de datos
            resultado = self.repositorioTransaccion.delete(id)
            print(f"Transacción eliminada permanentemente: {resultado}")
            
            return {
                "message": "Transacción eliminada permanentemente", 
                "transaccion": transaccion_eliminada,
                "eliminada": True
            }
        except Exception as e:
            print(f"Error al eliminar permanentemente la transacción: {e}")
            return {"error": f"Error al eliminar la transacción: {str(e)}"}, 500

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

        # Añadir información del tipo de transacción
        if "id_tipo_transaccion" in transaccion and transaccion["id_tipo_transaccion"]:
            tipo_transaccion = self.repositorioTipoTransaccion.findById(transaccion["id_tipo_transaccion"])
            if tipo_transaccion:
                transaccion_enriquecida["tipo_transaccion"] = tipo_transaccion

        # Añadir información del usuario que realizó la transacción
        if "id_usuario" in transaccion and transaccion["id_usuario"]:
            try:
                # Aquí deberías hacer una llamada al servicio de seguridad
                # Por ahora solo incluimos el ID
                transaccion_enriquecida["usuario"] = {
                    "id": transaccion["id_usuario"]
                }
            except Exception as e:
                print(f"Error al obtener datos de usuario: {e}")

        # Añadir información de cuenta origen y su usuario
        if "id_cuenta_origen" in transaccion and transaccion["id_cuenta_origen"]:
            cuenta_origen = self.repositorioCuenta.findById(transaccion["id_cuenta_origen"])
            if cuenta_origen:
                transaccion_enriquecida["cuenta_origen"] = cuenta_origen

        # Añadir información de cuenta destino
        if "id_cuenta_destino" in transaccion and transaccion["id_cuenta_destino"]:
            cuenta_destino = self.repositorioCuenta.findById(transaccion["id_cuenta_destino"])
            if cuenta_destino:
                transaccion_enriquecida["cuenta_destino"] = cuenta_destino

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
        # Eliminamos la línea que crea una nueva transacción aquí
        # nuevaTransaccion = Transaccion(infoTransaccion) <- ELIMINADA
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

        if origen == "ACCOUNT" and destino == "ACCOUNT":
            return self._transferenciaCuentaCuenta(infoTransaccion, monto)

        if origen == "ACCOUNT" and destino == "WALLET":
            return self._transferenciaCuentaBolsillo(infoTransaccion, monto)

        if origen == "WALLET" and destino == "ACCOUNT":
            return self._retiroBolsilloCuenta(infoTransaccion, monto)

        if origen == "BANK" and destino == "ACCOUNT":
            return self._consignacionBancoCuenta(infoTransaccion, monto)

        if origen == "BANK" and destino == "WALLET":
            return self._consignacionBancoBolsillo(infoTransaccion, monto)

        if origen == "ACCOUNT" and destino == "BANK":
            return self._retiroCuentaBanco(infoTransaccion, monto)

        if origen == "WALLET" and destino == "BANK":
            return self._retiroBolsilloBanco(infoTransaccion, monto)

        if origen == "WALLET" and destino == "WALLET":
            return self._transferenciaBolsilloBolsillo(infoTransaccion, monto)

        return {"error": "Tipo de movimiento no reconocido"}, 400

    """
    🔹 Métodos internos para manejar cada tipo de transacción
    """

    def _transferenciaCuentaCuenta(self, infoTransaccion, monto):
        # 🔍 Validación de campos requeridos
        campos_requeridos = [
            "id_cuenta_origen", "id_cuenta_destino",
            "id_tipo_movimiento", "id_tipo_transaccion",
            "descripcion", "uuid_transaccion", "monto"
        ]
        faltantes = [campo for campo in campos_requeridos if campo not in infoTransaccion]
        if faltantes:
            return {"error": f"Faltan campos requeridos: {', '.join(faltantes)}"}, 422

        cuenta_origen_id = infoTransaccion.get("id_cuenta_origen")
        cuenta_destino_id = infoTransaccion.get("id_cuenta_destino")
        descripcion = infoTransaccion.get("descripcion", "").strip()
        ...

        if not cuenta_origen_id or not cuenta_destino_id:
            return {"error": "Faltan cuentas origen o destino"}, 400

        cuenta_origen_data = self.repositorioCuenta.findById(cuenta_origen_id)
        cuenta_destino_data = self.repositorioCuenta.findById(cuenta_destino_id)

        if not cuenta_origen_data or not cuenta_destino_data:
            return {"error": "Cuenta origen o destino no encontrada"}, 404

        if not isinstance(cuenta_origen_data.get("saldo"), (int, float)) or cuenta_origen_data["saldo"] < monto:
            return {"error": "Saldo insuficiente en la cuenta origen"}, 400

        # 👇 Si viene un UUID, buscar por él
        uuid = infoTransaccion.get("uuid_transaccion")
        if uuid:
            existe = self.repositorioTransaccion.query({"uuid_transaccion": uuid})
            if existe:
                print("⚠️ Transacción duplicada detectada por UUID:", existe[0])
                return {"error": "Esta transacción ya fue registrada previamente"}, 409

        # 🔁 Recuperar id_usuario si no viene
        nueva_transaccion_data = infoTransaccion.copy()
        if "id_usuario" not in nueva_transaccion_data:
            nueva_transaccion_data["id_usuario"] = (
                    cuenta_origen_data.get("usuario_id") or
                    cuenta_origen_data.get("userId")
            )

        # 💰 Actualizar saldos
        cuenta_origen = Cuenta(cuenta_origen_data)
        cuenta_destino = Cuenta(cuenta_destino_data)
        cuenta_origen.saldo -= monto
        cuenta_destino.saldo += monto

        self.repositorioCuenta.save(cuenta_origen)
        self.repositorioCuenta.save(cuenta_destino)

        # 📝 Guardar transacción
        print("✅ Transacción que se intentará guardar:", nueva_transaccion_data)
        nueva_transaccion = Transaccion(nueva_transaccion_data)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)

        print("✅ Resultado de guardar transacción:", resultado)
        return resultado

    def _retiroBolsilloBanco(self, infoTransaccion, monto):
        # 🔍 Validación de campos requeridos
        campos_requeridos = [
            "id_bolsillo_origen",
            "id_tipo_movimiento",
            "id_tipo_transaccion",
            "descripcion",
            "uuid_transaccion",
            "monto"
        ]
        faltantes = [campo for campo in campos_requeridos if campo not in infoTransaccion]
        if faltantes:
            return {"error": f"Faltan campos requeridos: {', '.join(faltantes)}"}, 422

        bolsillo_id = infoTransaccion.get("id_bolsillo_origen")
        descripcion = infoTransaccion.get("descripcion", "").strip()

        try:
            monto = float(monto)
        except (TypeError, ValueError):
            return {"error": "El monto debe ser un número válido"}, 400

        if not bolsillo_id:
            return {"error": "Falta id_bolsillo_origen"}, 400

        bolsillo_origen_data = self.repositorioBolsillo.findById(bolsillo_id)
        if not bolsillo_origen_data:
            return {"error": "Bolsillo origen no encontrado"}, 404

        bolsillo_origen = Bolsillo(bolsillo_origen_data)

        if bolsillo_origen.saldo < monto:
            return {"error": "Saldo insuficiente en el bolsillo"}, 400

        # 👇 Si viene un UUID, buscar por él
        uuid = infoTransaccion.get("uuid_transaccion")
        if uuid:
            existe = self.repositorioTransaccion.query({"uuid_transaccion": uuid})
            if existe:
                print("⚠️ Transacción duplicada detectada por UUID:", existe[0])
                return {"error": "Esta transacción ya fue registrada previamente"}, 409

        # Preparar datos de transacción con copia segura
        nueva_transaccion_data = infoTransaccion.copy()
        nueva_transaccion_data["descripcion"] = descripcion

        if "id_usuario" not in nueva_transaccion_data:
            id_cuenta = bolsillo_origen_data.get("id_cuenta")
            if id_cuenta:
                cuenta_data = self.repositorioCuenta.findById(id_cuenta)
                if cuenta_data:
                    nueva_transaccion_data["id_usuario"] = (
                            cuenta_data.get("usuario_id") or cuenta_data.get("userId")
                    )

        # 💰 Actualizar saldo
        bolsillo_origen.saldo -= monto
        self.repositorioBolsillo.save(bolsillo_origen)

        # 📝 Guardar transacción
        print("✅ Guardando retiro de bolsillo a banco:", nueva_transaccion_data)
        nueva_transaccion = Transaccion(nueva_transaccion_data)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)

        print("✅ Retiro de bolsillo a banco guardado:", resultado)
        return resultado

    def _transferenciaBolsilloBolsillo(self, infoTransaccion, monto):
        # 🔍 Validación de campos requeridos
        campos_requeridos = [
            "id_bolsillo_origen", "id_bolsillo_destino",
            "id_tipo_movimiento", "id_tipo_transaccion",
            "descripcion", "uuid_transaccion", "monto"
        ]
        faltantes = [campo for campo in campos_requeridos if campo not in infoTransaccion]
        if faltantes:
            return {"error": f"Faltan campos requeridos: {', '.join(faltantes)}"}, 422

        bolsillo_origen_id = infoTransaccion.get("id_bolsillo_origen")
        bolsillo_destino_id = infoTransaccion.get("id_bolsillo_destino")
        descripcion = infoTransaccion.get("descripcion", "").strip()

        # 🔢 Validar que monto sea numérico
        try:
            monto = float(monto)
        except (TypeError, ValueError):
            return {"error": "El monto debe ser un número válido"}, 400

        if not bolsillo_origen_id or not bolsillo_destino_id:
            return {"error": "Falta ID de bolsillo origen o destino"}, 400

        bolsillo_origen_data = self.repositorioBolsillo.findById(bolsillo_origen_id)
        bolsillo_destino_data = self.repositorioBolsillo.findById(bolsillo_destino_id)

        if not bolsillo_origen_data or not bolsillo_destino_data:
            return {"error": "Bolsillo origen o destino no encontrado"}, 404

        bolsillo_origen = Bolsillo(bolsillo_origen_data)
        bolsillo_destino = Bolsillo(bolsillo_destino_data)

        if bolsillo_origen.saldo < monto:
            return {"error": "Saldo insuficiente en el bolsillo origen"}, 400

        # 🔁 Verificar duplicidad por UUID
        uuid = infoTransaccion.get("uuid_transaccion")
        if uuid:
            existe = self.repositorioTransaccion.query({"uuid_transaccion": uuid})
            if existe:
                print("⚠️ Transacción duplicada detectada por UUID:", existe[0])
                return {"error": "Esta transacción ya fue registrada previamente"}, 409

        # 🧾 Preparar datos para guardar
        nueva_transaccion_data = infoTransaccion.copy()
        nueva_transaccion_data["descripcion"] = descripcion

        if "id_usuario" not in nueva_transaccion_data:
            id_cuenta = bolsillo_origen_data.get("id_cuenta")
            if id_cuenta:
                cuenta_data = self.repositorioCuenta.findById(id_cuenta)
                if cuenta_data:
                    nueva_transaccion_data["id_usuario"] = (
                            cuenta_data.get("usuario_id") or cuenta_data.get("userId")
                    )

        # 💰 Actualizar saldos
        bolsillo_origen.saldo -= monto
        bolsillo_destino.saldo += monto

        self.repositorioBolsillo.save(bolsillo_origen)
        self.repositorioBolsillo.save(bolsillo_destino)

        # 📝 Guardar transacción
        nueva_transaccion = Transaccion(nueva_transaccion_data)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)

        print("✅ Transferencia entre bolsillos guardada:", resultado)
        return resultado

    def _transferenciaCuentaBolsillo(self, infoTransaccion, monto):
        # 🔍 Validación de campos requeridos
        campos_requeridos = [
            "id_cuenta_origen", "id_bolsillo_destino",
            "id_tipo_movimiento", "id_tipo_transaccion",
            "descripcion", "uuid_transaccion", "monto"
        ]
        faltantes = [campo for campo in campos_requeridos if campo not in infoTransaccion]
        if faltantes:
            return {"error": f"Faltan campos requeridos: {', '.join(faltantes)}"}, 422

        cuenta_origen_id = infoTransaccion.get("id_cuenta_origen")
        bolsillo_destino_id = infoTransaccion.get("id_bolsillo_destino")
        descripcion = infoTransaccion.get("descripcion", "").strip()

        # 🔢 Validar monto como número
        try:
            monto = float(monto)
        except (TypeError, ValueError):
            return {"error": "El monto debe ser un número válido"}, 400

        if not cuenta_origen_id or not bolsillo_destino_id:
            return {"error": "Falta ID de cuenta origen o bolsillo destino"}, 400

        cuenta_origen_data = self.repositorioCuenta.findById(cuenta_origen_id)
        bolsillo_destino_data = self.repositorioBolsillo.findById(bolsillo_destino_id)

        if not cuenta_origen_data or not bolsillo_destino_data:
            return {"error": "Cuenta origen o bolsillo destino no encontrado"}, 404

        cuenta_origen = Cuenta(cuenta_origen_data)
        bolsillo_destino = Bolsillo(bolsillo_destino_data)

        if cuenta_origen.saldo < monto:
            return {"error": "Saldo insuficiente en la cuenta origen"}, 400

        # 🔁 Verificar duplicado por UUID
        uuid = infoTransaccion.get("uuid_transaccion")
        if uuid:
            existe = self.repositorioTransaccion.query({"uuid_transaccion": uuid})
            if existe:
                print("⚠️ Transacción duplicada detectada por UUID:", existe[0])
                return {"error": "Esta transacción ya fue registrada previamente"}, 409

        nueva_transaccion_data = infoTransaccion.copy()
        nueva_transaccion_data["descripcion"] = descripcion

        if "id_usuario" not in nueva_transaccion_data:
            nueva_transaccion_data["id_usuario"] = (
                    cuenta_origen_data.get("usuario_id") or cuenta_origen_data.get("userId")
            )

        # 💰 Actualizar saldos
        cuenta_origen.saldo -= monto
        bolsillo_destino.saldo += monto

        self.repositorioCuenta.save(cuenta_origen)
        self.repositorioBolsillo.save(bolsillo_destino)

        # 📝 Guardar transacción
        print("✅ Guardando transacción de cuenta a bolsillo:", nueva_transaccion_data)
        nueva_transaccion = Transaccion(nueva_transaccion_data)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)
        print("✅ Transacción guardada:", resultado)

        return resultado

    def _retiroCuentaBanco(self, infoTransaccion, monto):
        # 🔍 Validación de campos requeridos
        campos_requeridos = [
            "id_cuenta_origen", "id_tipo_movimiento", "id_tipo_transaccion",
            "descripcion", "uuid_transaccion", "monto"
        ]
        faltantes = [campo for campo in campos_requeridos if campo not in infoTransaccion]
        if faltantes:
            return {"error": f"Faltan campos requeridos: {', '.join(faltantes)}"}, 422

        cuenta_origen_id = infoTransaccion.get("id_cuenta_origen")
        descripcion = infoTransaccion.get("descripcion", "").strip()

        # 🔢 Validar monto como número
        try:
            monto = float(monto)
        except (TypeError, ValueError):
            return {"error": "El monto debe ser un número válido"}, 400

        if not cuenta_origen_id:
            return {"error": "Falta el ID de la cuenta origen"}, 400

        cuenta_origen_data = self.repositorioCuenta.findById(cuenta_origen_id)
        if not cuenta_origen_data:
            return {"error": "Cuenta origen no encontrada"}, 404

        cuenta_origen = Cuenta(cuenta_origen_data)

        if cuenta_origen.saldo < monto:
            return {"error": "Saldo insuficiente en la cuenta"}, 400

        # 🔁 Validar duplicado por UUID
        uuid = infoTransaccion.get("uuid_transaccion")
        if uuid:
            existe = self.repositorioTransaccion.query({"uuid_transaccion": uuid})
            if existe:
                print("⚠️ Transacción duplicada detectada por UUID:", existe[0])
                return {"error": "Esta transacción ya fue registrada previamente"}, 409

        nueva_transaccion_data = infoTransaccion.copy()
        nueva_transaccion_data["descripcion"] = descripcion

        if "id_usuario" not in nueva_transaccion_data:
            nueva_transaccion_data["id_usuario"] = (
                    cuenta_origen_data.get("usuario_id") or cuenta_origen_data.get("userId")
            )

        # 💰 Actualizar saldo
        cuenta_origen.saldo -= monto
        self.repositorioCuenta.save(cuenta_origen)

        # 📝 Guardar transacción
        print("✅ Guardando transacción de retiro de cuenta a banco:", nueva_transaccion_data)
        nueva_transaccion = Transaccion(nueva_transaccion_data)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)
        print("✅ Transacción guardada:", resultado)

        return resultado

    def _consignacionBancoCuenta(self, infoTransaccion, monto):
        # ✅ Validación de campos requeridos
        campos_requeridos = [
            "id_cuenta_destino", "id_tipo_movimiento", "id_tipo_transaccion",
            "descripcion", "uuid_transaccion", "monto"
        ]
        faltantes = [campo for campo in campos_requeridos if campo not in infoTransaccion]
        if faltantes:
            return {"error": f"Faltan campos requeridos: {', '.join(faltantes)}"}, 422

        cuenta_destino_id = infoTransaccion.get("id_cuenta_destino")
        descripcion = infoTransaccion.get("descripcion", "").strip()

        # 🔢 Validar monto como número
        try:
            monto = float(monto)
        except (TypeError, ValueError):
            return {"error": "El monto debe ser un número válido"}, 400

        if not cuenta_destino_id:
            return {"error": "Falta id_cuenta_destino en la transacción"}, 400

        cuenta_destino_data = self.repositorioCuenta.findById(cuenta_destino_id)
        if not cuenta_destino_data:
            return {"error": "Cuenta destino no encontrada"}, 404

        # 🧿 Validar duplicación por UUID
        uuid = infoTransaccion.get("uuid_transaccion")
        if uuid:
            existe = self.repositorioTransaccion.query({"uuid_transaccion": uuid})
            if existe:
                print("⚠️ Transacción duplicada detectada por UUID:", existe[0])
                return {"error": "Esta transacción ya fue registrada previamente"}, 409

        # 📝 Preparar transacción
        nueva_transaccion_data = infoTransaccion.copy()
        nueva_transaccion_data["descripcion"] = descripcion

        if "id_usuario" not in nueva_transaccion_data:
            nueva_transaccion_data["id_usuario"] = (
                    cuenta_destino_data.get("usuario_id") or cuenta_destino_data.get("userId")
            )

        # 💰 Actualizar saldo
        cuenta_destino = Cuenta(cuenta_destino_data)
        cuenta_destino.saldo += monto
        self.repositorioCuenta.save(cuenta_destino)

        # 🧾 Guardar transacción
        print("✅ Guardando transacción de consignación banco → cuenta:", nueva_transaccion_data)
        nueva_transaccion = Transaccion(nueva_transaccion_data)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)
        print("✅ Transacción guardada:", resultado)

        return resultado

    def _consignacionBancoBolsillo(self, infoTransaccion, monto):
        """
        Maneja la consignación desde el banco a un bolsillo.
        """
        # ✅ Validación de campos requeridos
        campos_requeridos = [
            "id_bolsillo_destino", "id_tipo_movimiento", "id_tipo_transaccion",
            "descripcion", "uuid_transaccion", "monto"
        ]
        faltantes = [campo for campo in campos_requeridos if campo not in infoTransaccion]
        if faltantes:
            return {"error": f"Faltan campos requeridos: {', '.join(faltantes)}"}, 422

        id_bolsillo_destino = infoTransaccion.get("id_bolsillo_destino")
        descripcion = infoTransaccion.get("descripcion", "").strip()

        # 🔢 Validar monto
        try:
            monto = float(monto)
        except (TypeError, ValueError):
            return {"error": "El monto debe ser un número válido"}, 400

        if not id_bolsillo_destino:
            return {"error": "Falta id_bolsillo_destino en la transacción"}, 400

        bolsillo_destino_data = self.repositorioBolsillo.findById(id_bolsillo_destino)
        if not bolsillo_destino_data:
            return {"error": "Bolsillo destino no encontrado"}, 404

        # 🚫 Verificar duplicado por UUID
        uuid = infoTransaccion.get("uuid_transaccion")
        if uuid:
            existe = self.repositorioTransaccion.query({"uuid_transaccion": uuid})
            if existe:
                print("⚠️ Transacción duplicada detectada por UUID:", existe[0])
                return {"error": "Esta transacción ya fue registrada previamente"}, 409

        nueva_transaccion_data = infoTransaccion.copy()
        nueva_transaccion_data["descripcion"] = descripcion

        # 👤 Obtener el ID del usuario si no está presente
        if "id_usuario" not in nueva_transaccion_data:
            cuenta_data = None
            if "id_cuenta" in bolsillo_destino_data:
                cuenta_data = self.repositorioCuenta.findById(bolsillo_destino_data["id_cuenta"])
            if cuenta_data:
                nueva_transaccion_data["id_usuario"] = (
                        cuenta_data.get("usuario_id") or cuenta_data.get("userId")
                )

        # 💰 Aumentar saldo en el bolsillo
        bolsillo_destino = Bolsillo(bolsillo_destino_data)
        bolsillo_destino.saldo += monto
        self.repositorioBolsillo.save(bolsillo_destino)

        # 📝 Guardar la transacción
        print("✅ Guardando consignación banco → bolsillo:", nueva_transaccion_data)
        nueva_transaccion = Transaccion(nueva_transaccion_data)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)
        print("✅ Transacción guardada:", resultado)

        return resultado

    """
    🔹 Actualizar una transacción
    """

    def actualizar(self, id, infoTransaccion):
        print(f"Actualizando transacción con ID: {id}, datos: {infoTransaccion}")
        transaccion_actual = self.repositorioTransaccion.findById(id)

        if not transaccion_actual:
            print(f"Error: Transacción con ID {id} no encontrada")
            return {"error": "Transacción no encontrada"}, 404

        # Aseguramos que transaccion_actual es un objeto de Transaccion
        if isinstance(transaccion_actual, dict):
            transaccion_actual = Transaccion(transaccion_actual)

        # Permitir cambiar descripción, fecha_transaccion y estado
        transaccion_actual.descripcion = infoTransaccion.get("descripcion", transaccion_actual.descripcion)
        transaccion_actual.fecha_transaccion = infoTransaccion.get("fecha_transaccion", transaccion_actual.fecha_transaccion)
        
        # Permitir actualizar el estado de la transacción
        if "estado" in infoTransaccion:
            print(f"Cambiando estado de transacción de {transaccion_actual.estado} a {infoTransaccion['estado']}")
            transaccion_actual.estado = infoTransaccion["estado"]

        resultado = self.repositorioTransaccion.save(transaccion_actual)
        print(f"Resultado de actualizar transacción: {resultado}")
        return resultado

    """
    🔹 Eliminar una transacción
    """

    def anular(self, id, reintegrar_fondos=True):
        """
        Anula una transacción y reintegra el dinero a las cuentas correspondientes.

        Args:
            id (str): ID de la transacción a anular
            reintegrar_fondos (bool): Indica si se debe reintegrar el dinero

        Returns:
            dict: Mensaje de confirmación o error
        """
        print(f"Intentando anular transacción con ID: {id}")

        # Verificar que la transacción existe
        transaccion_data = self.repositorioTransaccion.findById(id)
        if not transaccion_data:
            print(f"Error: Transacción con ID {id} no encontrada")
            return {"error": "Transacción no encontrada"}, 404

        print(f"Transacción encontrada: {transaccion_data}")

        # Guardar una copia de la transacción para retornarla en la respuesta
        transaccion_eliminada = transaccion_data.copy()
        
        # Verificar si la transacción ya está anulada
        if "estado" in transaccion_data and transaccion_data["estado"] == "ANULADA":
            return {"message": "La transacción ya estaba anulada", "transaccion": transaccion_data}

        # Reintegrar el dinero según el tipo de transacción
        print(f"Datos completos de la transacción: {transaccion_data}")
        
        # Verificar el monto de la transacción
        monto = transaccion_data.get("monto", 0)
        print(f"Monto obtenido de la transacción: {monto}, tipo: {type(monto)}")
        
        if not monto:
            print("Advertencia: La transacción no tiene monto especificado o es cero")
            monto = 0
        
        resultado_actualizar = None
        
        try:
            # Verificar si debemos reintegrar fondos
            if not reintegrar_fondos:
                print("No se solicitó reintegrar fondos, solo se marcará la transacción como ANULADA")
            else:
                print(f"Reintegrando fondos para la transacción {id} con monto {monto}")
                
                # Asegurarnos de que el monto sea numérico
                if isinstance(monto, str):
                    monto = float(monto)
                
                # Caso 1: Transferencia entre cuentas
                if "id_cuenta_origen" in transaccion_data and "id_cuenta_destino" in transaccion_data:
                    print("Reintegrando dinero en transferencia entre cuentas")
                    cuenta_origen_id = transaccion_data["id_cuenta_origen"]
                    cuenta_destino_id = transaccion_data["id_cuenta_destino"]
                    
                    print(f"Buscando cuenta origen con ID: {cuenta_origen_id}")
                    cuenta_origen_data = self.repositorioCuenta.findById(cuenta_origen_id)
                    print(f"Cuenta origen encontrada: {cuenta_origen_data is not None}")
                    if cuenta_origen_data:
                        print(f"Datos de cuenta origen: {cuenta_origen_data}")
                    else:
                        print(f"ERROR: No se encontró la cuenta origen con ID {cuenta_origen_id}")
                    
                    print(f"Buscando cuenta destino con ID: {cuenta_destino_id}")
                    cuenta_destino_data = self.repositorioCuenta.findById(cuenta_destino_id)
                    print(f"Cuenta destino encontrada: {cuenta_destino_data is not None}")
                    if cuenta_destino_data:
                        print(f"Datos de cuenta destino: {cuenta_destino_data}")
                    else:
                        print(f"ERROR: No se encontró la cuenta destino con ID {cuenta_destino_id}")
                    
                    if cuenta_origen_data and cuenta_destino_data:
                        cuenta_origen = Cuenta(cuenta_origen_data)
                        cuenta_destino = Cuenta(cuenta_destino_data)
                        
                        print(f"Saldo actual cuenta origen: {cuenta_origen.saldo}")
                        print(f"Saldo actual cuenta destino: {cuenta_destino.saldo}")
                        
                        # Ensure saldo values are numeric
                        if isinstance(cuenta_origen.saldo, str):
                            cuenta_origen.saldo = float(cuenta_origen.saldo)
                        if isinstance(cuenta_destino.saldo, str):
                            cuenta_destino.saldo = float(cuenta_destino.saldo)
                            
                        # Revertir: sumar a la cuenta origen y restar de la cuenta destino
                        print(f"Reintegrando {monto} de la cuenta destino a la cuenta origen")
                        cuenta_origen.saldo = float(cuenta_origen.saldo) + float(monto)
                        cuenta_destino.saldo = float(cuenta_destino.saldo) - float(monto)
                        
                        print(f"Nuevo saldo cuenta origen: {cuenta_origen.saldo}")
                        print(f"Nuevo saldo cuenta destino: {cuenta_destino.saldo}")
                        
                        # Guardar los cambios en la base de datos - con más detalle para depuración
                        print(f"Guardando cuenta origen con ID {cuenta_origen_id} y nuevo saldo {cuenta_origen.saldo}")
                        cuenta_origen_actualizada = self.repositorioCuenta.save(cuenta_origen)
                        print(f"Cuenta origen actualizada: {cuenta_origen_actualizada}")
                        
                        print(f"Guardando cuenta destino con ID {cuenta_destino_id} y nuevo saldo {cuenta_destino.saldo}")
                        cuenta_destino_actualizada = self.repositorioCuenta.save(cuenta_destino)
                        print(f"Cuenta destino actualizada: {cuenta_destino_actualizada}")
                        
                        # Verificar que los cambios se guardaron correctamente
                        cuenta_origen_verificada = self.repositorioCuenta.findById(cuenta_origen_id)
                        cuenta_destino_verificada = self.repositorioCuenta.findById(cuenta_destino_id)
                        
                        print(f"Verificación - Cuenta origen: {cuenta_origen_verificada}")
                        print(f"Verificación - Cuenta destino: {cuenta_destino_verificada}")
                        
                        print(f"Dinero reintegrado: {monto} de cuenta {cuenta_destino_id} a cuenta {cuenta_origen_id}")
                    else:
                        print(f"ERROR: No se encontraron las cuentas para reintegrar fondos")
                
                # Caso 2: Transferencia de cuenta a bolsillo
                elif "id_cuenta_origen" in transaccion_data and "id_bolsillo_destino" in transaccion_data:
                    print("Reintegrando dinero en transferencia de cuenta a bolsillo")
                    cuenta_origen_id = transaccion_data["id_cuenta_origen"]
                    bolsillo_destino_id = transaccion_data["id_bolsillo_destino"]
                    
                    print(f"Buscando cuenta origen con ID: {cuenta_origen_id}")
                    cuenta_origen_data = self.repositorioCuenta.findById(cuenta_origen_id)
                    print(f"Cuenta origen encontrada: {cuenta_origen_data is not None}")
                    if cuenta_origen_data:
                        print(f"Datos de cuenta origen: {cuenta_origen_data}")
                        if 'saldo' in cuenta_origen_data:
                            print(f"Saldo actual de cuenta origen: {cuenta_origen_data['saldo']}")
                        else:
                            print("ERROR: La cuenta origen no tiene campo 'saldo'")
                    else:
                        print(f"ERROR: No se encontró la cuenta origen con ID {cuenta_origen_id}")
                    
                    print(f"Buscando bolsillo destino con ID: {bolsillo_destino_id}")
                    bolsillo_destino_data = self.repositorioBolsillo.findById(bolsillo_destino_id)
                    print(f"Bolsillo destino encontrado: {bolsillo_destino_data is not None}")
                    if bolsillo_destino_data:
                        print(f"Datos de bolsillo destino: {bolsillo_destino_data}")
                        if 'saldo' in bolsillo_destino_data:
                            print(f"Saldo actual de bolsillo destino: {bolsillo_destino_data['saldo']}")
                        else:
                            print("ERROR: El bolsillo destino no tiene campo 'saldo'")
                    else:
                        print(f"ERROR: No se encontró el bolsillo destino con ID {bolsillo_destino_id}")
                    
                    if cuenta_origen_data and bolsillo_destino_data:
                        cuenta_origen = Cuenta(cuenta_origen_data)
                        bolsillo_destino = Bolsillo(bolsillo_destino_data)
                        
                        print(f"Saldo actual cuenta origen: {cuenta_origen.saldo}")
                        print(f"Saldo actual bolsillo destino: {bolsillo_destino.saldo}")
                        
                        # Ensure saldo values are numeric
                        if isinstance(cuenta_origen.saldo, str):
                            cuenta_origen.saldo = float(cuenta_origen.saldo)
                        if isinstance(bolsillo_destino.saldo, str):
                            bolsillo_destino.saldo = float(bolsillo_destino.saldo)
                            
                        # Revertir: sumar a la cuenta origen y restar del bolsillo destino
                        print(f"Reintegrando {monto} del bolsillo destino a la cuenta origen")
                        cuenta_origen.saldo = float(cuenta_origen.saldo) + float(monto)
                        bolsillo_destino.saldo = float(bolsillo_destino.saldo) - float(monto)
                        
                        print(f"Nuevo saldo cuenta origen: {cuenta_origen.saldo}")
                        print(f"Nuevo saldo bolsillo destino: {bolsillo_destino.saldo}")
                        
                        # Guardar los cambios en la base de datos - con más detalle para depuración
                        print(f"Guardando cuenta origen con ID {cuenta_origen_id} y nuevo saldo {cuenta_origen.saldo}")
                        cuenta_origen_actualizada = self.repositorioCuenta.save(cuenta_origen)
                        print(f"Cuenta origen actualizada: {cuenta_origen_actualizada}")
                        
                        print(f"Guardando bolsillo destino con ID {bolsillo_destino_id} y nuevo saldo {bolsillo_destino.saldo}")
                        bolsillo_destino_actualizado = self.repositorioBolsillo.save(bolsillo_destino)
                        print(f"Bolsillo destino actualizado: {bolsillo_destino_actualizado}")
                        
                        # Verificar que los cambios se guardaron correctamente
                        cuenta_origen_verificada = self.repositorioCuenta.findById(cuenta_origen_id)
                        bolsillo_destino_verificado = self.repositorioBolsillo.findById(bolsillo_destino_id)
                        
                        print(f"Verificación - Cuenta origen: {cuenta_origen_verificada}")
                        print(f"Verificación - Bolsillo destino: {bolsillo_destino_verificado}")
                        
                        print(f"Dinero reintegrado: {monto} de bolsillo {bolsillo_destino_id} a cuenta {cuenta_origen_id}")
                    else:
                        print(f"ERROR: No se encontraron la cuenta o bolsillo para reintegrar fondos")
                
                # Caso 3: Transferencia de bolsillo a cuenta
                elif "id_bolsillo_origen" in transaccion_data and "id_cuenta_destino" in transaccion_data:
                    print("Reintegrando dinero en transferencia de bolsillo a cuenta")
                    bolsillo_origen_id = transaccion_data["id_bolsillo_origen"]
                    cuenta_destino_id = transaccion_data["id_cuenta_destino"]
                    
                    print(f"Buscando bolsillo origen con ID: {bolsillo_origen_id}")
                    bolsillo_origen_data = self.repositorioBolsillo.findById(bolsillo_origen_id)
                    print(f"Bolsillo origen encontrado: {bolsillo_origen_data is not None}")
                    
                    print(f"Buscando cuenta destino con ID: {cuenta_destino_id}")
                    cuenta_destino_data = self.repositorioCuenta.findById(cuenta_destino_id)
                    print(f"Cuenta destino encontrada: {cuenta_destino_data is not None}")
                    
                    if bolsillo_origen_data and cuenta_destino_data:
                        bolsillo_origen = Bolsillo(bolsillo_origen_data)
                        cuenta_destino = Cuenta(cuenta_destino_data)
                        
                        print(f"Saldo actual bolsillo origen: {bolsillo_origen.saldo}")
                        print(f"Saldo actual cuenta destino: {cuenta_destino.saldo}")
                        
                        # Ensure saldo values are numeric
                        if isinstance(bolsillo_origen.saldo, str):
                            bolsillo_origen.saldo = float(bolsillo_origen.saldo)
                        if isinstance(cuenta_destino.saldo, str):
                            cuenta_destino.saldo = float(cuenta_destino.saldo)
                            
                        # Revertir: sumar al bolsillo origen y restar de la cuenta destino
                        print(f"Reintegrando {monto} de la cuenta destino al bolsillo origen")
                        bolsillo_origen.saldo = float(bolsillo_origen.saldo) + float(monto)
                        cuenta_destino.saldo = float(cuenta_destino.saldo) - float(monto)
                        
                        print(f"Nuevo saldo bolsillo origen: {bolsillo_origen.saldo}")
                        print(f"Nuevo saldo cuenta destino: {cuenta_destino.saldo}")
                        
                        # Guardar los cambios en la base de datos - con más detalle para depuración
                        print(f"Guardando bolsillo origen con ID {bolsillo_origen_id} y nuevo saldo {bolsillo_origen.saldo}")
                        bolsillo_origen_actualizado = self.repositorioBolsillo.save(bolsillo_origen)
                        print(f"Bolsillo origen actualizado: {bolsillo_origen_actualizado}")
                        
                        print(f"Guardando cuenta destino con ID {cuenta_destino_id} y nuevo saldo {cuenta_destino.saldo}")
                        cuenta_destino_actualizada = self.repositorioCuenta.save(cuenta_destino)
                        print(f"Cuenta destino actualizada: {cuenta_destino_actualizada}")
                        
                        # Verificar que los cambios se guardaron correctamente
                        bolsillo_origen_verificado = self.repositorioBolsillo.findById(bolsillo_origen_id)
                        cuenta_destino_verificada = self.repositorioCuenta.findById(cuenta_destino_id)
                        
                        print(f"Verificación - Bolsillo origen: {bolsillo_origen_verificado}")
                        print(f"Verificación - Cuenta destino: {cuenta_destino_verificada}")
                        
                        print(f"Dinero reintegrado: {monto} de cuenta {cuenta_destino_id} a bolsillo {bolsillo_origen_id}")
                    else:
                        print(f"ERROR: No se encontraron el bolsillo o la cuenta para reintegrar fondos")
                
                # Caso 4: Transferencia entre bolsillos
                elif "id_bolsillo_origen" in transaccion_data and "id_bolsillo_destino" in transaccion_data:
                    print("Reintegrando dinero en transferencia entre bolsillos")
                    bolsillo_origen_id = transaccion_data["id_bolsillo_origen"]
                    bolsillo_destino_id = transaccion_data["id_bolsillo_destino"]
                    
                    print(f"Buscando bolsillo origen con ID: {bolsillo_origen_id}")
                    bolsillo_origen_data = self.repositorioBolsillo.findById(bolsillo_origen_id)
                    print(f"Bolsillo origen encontrado: {bolsillo_origen_data is not None}")
                    
                    print(f"Buscando bolsillo destino con ID: {bolsillo_destino_id}")
                    bolsillo_destino_data = self.repositorioBolsillo.findById(bolsillo_destino_id)
                    print(f"Bolsillo destino encontrado: {bolsillo_destino_data is not None}")
                    
                    if bolsillo_origen_data and bolsillo_destino_data:
                        bolsillo_origen = Bolsillo(bolsillo_origen_data)
                        bolsillo_destino = Bolsillo(bolsillo_destino_data)
                        
                        print(f"Saldo actual bolsillo origen: {bolsillo_origen.saldo}")
                        print(f"Saldo actual bolsillo destino: {bolsillo_destino.saldo}")
                        
                        # Ensure saldo values are numeric
                        if isinstance(bolsillo_origen.saldo, str):
                            bolsillo_origen.saldo = float(bolsillo_origen.saldo)
                        if isinstance(bolsillo_destino.saldo, str):
                            bolsillo_destino.saldo = float(bolsillo_destino.saldo)
                            
                        # Revertir: sumar al bolsillo origen y restar del bolsillo destino
                        print(f"Reintegrando {monto} del bolsillo destino al bolsillo origen")
                        bolsillo_origen.saldo = float(bolsillo_origen.saldo) + float(monto)
                        bolsillo_destino.saldo = float(bolsillo_destino.saldo) - float(monto)
                        
                        print(f"Nuevo saldo bolsillo origen: {bolsillo_origen.saldo}")
                        print(f"Nuevo saldo bolsillo destino: {bolsillo_destino.saldo}")
                        
                        # Guardar los cambios en la base de datos - con más detalle para depuración
                        print(f"Guardando bolsillo origen con ID {bolsillo_origen_id} y nuevo saldo {bolsillo_origen.saldo}")
                        bolsillo_origen_actualizado = self.repositorioBolsillo.save(bolsillo_origen)
                        print(f"Bolsillo origen actualizado: {bolsillo_origen_actualizado}")
                        
                        print(f"Guardando bolsillo destino con ID {bolsillo_destino_id} y nuevo saldo {bolsillo_destino.saldo}")
                        bolsillo_destino_actualizado = self.repositorioBolsillo.save(bolsillo_destino)
                        print(f"Bolsillo destino actualizado: {bolsillo_destino_actualizado}")
                        
                        # Verificar que los cambios se guardaron correctamente
                        bolsillo_origen_verificado = self.repositorioBolsillo.findById(bolsillo_origen_id)
                        bolsillo_destino_verificado = self.repositorioBolsillo.findById(bolsillo_destino_id)
                        
                        print(f"Verificación - Bolsillo origen: {bolsillo_origen_verificado}")
                        print(f"Verificación - Bolsillo destino: {bolsillo_destino_verificado}")
                        
                        print(f"Dinero reintegrado: {monto} de bolsillo {bolsillo_destino_id} a bolsillo {bolsillo_origen_id}")
                    else:
                        print(f"ERROR: No se encontraron los bolsillos para reintegrar fondos")
                
                # Otros casos (consignaciones, retiros)
                else:
                    print("Tipo de transacción no soportado para reintegro automático")
                    print(f"Datos de la transacción: {transaccion_data}")
                    print("No se pudo reintegrar el dinero automáticamente")
            
            # Cambiar el estado a ANULADA
            transaccion = Transaccion(transaccion_data)
            transaccion.estado = "ANULADA"
            resultado_actualizar = self.repositorioTransaccion.save(transaccion)
            print(f"Transacción con ID {id} marcada como ANULADA")
            
            # Retornar mensaje de éxito junto con los datos de la transacción anulada
            return {
                "message": "Transacción anulada correctamente y dinero reintegrado", 
                "transaccion": resultado_actualizar,
                "anulada": True
            }
            
        except Exception as e:
            print(f"Error al anular la transacción: {e}")
            return {"error": f"Error al anular la transacción: {str(e)}"}, 500
