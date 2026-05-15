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
        return transacciones

    def obtener_por_id(self, id):
        transaccion = self.repositorioTransaccion.findById(id)
        if transaccion:
            return transaccion
        return {"error": "Transacción no encontrada"}, 404

    def eliminar_permanente(self, id):
        transaccion_data = self.repositorioTransaccion.findById(id)
        if not transaccion_data:
            return {"error": "Transacción no encontrada"}, 404

        transaccion_eliminada = transaccion_data.copy()

        try:
            resultado = self.repositorioTransaccion.delete(id)

            return {
                "message": "Transacción eliminada permanentemente",
                "transaccion": transaccion_eliminada,
                "eliminada": True
            }
        except Exception as e:
            return {"error": f"Error al eliminar la transacción: {str(e)}"}, 500

    def obtener_por_usuario(self, id_usuario):
        cuentas_usuario = self.repositorioCuenta.query({"usuario_id": id_usuario})

        if not cuentas_usuario:
            cuentas_usuario = self.repositorioCuenta.query({"userId": id_usuario})

        if not cuentas_usuario:
            cuentas_usuario = self.repositorioCuenta.query({"id_usuario": id_usuario})

        if not cuentas_usuario:
            return []

        todas_transacciones = self.repositorioTransaccion.findAll()

        transacciones_usuario = []
        ids_cuentas = [cuenta["_id"] for cuenta in cuentas_usuario]

        bolsillos_usuario = []
        for cuenta in cuentas_usuario:
            if cuenta.get("id_bolsillo"):
                bolsillo = self.repositorioBolsillo.findById(cuenta["id_bolsillo"])
                if bolsillo:
                    bolsillos_usuario.append(bolsillo)

        ids_bolsillos = [bolsillo["_id"] for bolsillo in bolsillos_usuario]

        for transaccion in todas_transacciones:
            cuenta_origen_match = "id_cuenta_origen" in transaccion and transaccion["id_cuenta_origen"] in ids_cuentas
            cuenta_destino_match = "id_cuenta_destino" in transaccion and transaccion["id_cuenta_destino"] in ids_cuentas
            bolsillo_origen_match = "id_bolsillo_origen" in transaccion and transaccion["id_bolsillo_origen"] in ids_bolsillos
            bolsillo_destino_match = "id_bolsillo_destino" in transaccion and transaccion["id_bolsillo_destino"] in ids_bolsillos

            if cuenta_origen_match or cuenta_destino_match or bolsillo_origen_match or bolsillo_destino_match:
                transaccion_enriquecida = self._enriquecer_transaccion(transaccion)
                transacciones_usuario.append(transaccion_enriquecida)

        return transacciones_usuario

    def obtener_proximos_pagos(self, id_usuario):
        transacciones_usuario = self.obtener_por_usuario(id_usuario)

        proximos_pagos = []
        for transaccion in transacciones_usuario:
            if transaccion.get("es_pago_programado", False) and transaccion.get("estado", "") == "PENDIENTE":
                proximos_pagos.append(transaccion)

        return proximos_pagos

    def _enriquecer_transaccion(self, transaccion):
        transaccion_enriquecida = transaccion.copy()

        if "id_tipo_movimiento" in transaccion and transaccion["id_tipo_movimiento"]:
            tipo_movimiento = self.repositorioTipoMovimiento.findById(transaccion["id_tipo_movimiento"])
            if tipo_movimiento:
                transaccion_enriquecida["tipo_movimiento"] = tipo_movimiento

        if "id_tipo_transaccion" in transaccion and transaccion["id_tipo_transaccion"]:
            tipo_transaccion = self.repositorioTipoTransaccion.findById(transaccion["id_tipo_transaccion"])
            if tipo_transaccion:
                transaccion_enriquecida["tipo_transaccion"] = tipo_transaccion

        if "id_usuario" in transaccion and transaccion["id_usuario"]:
            try:
                transaccion_enriquecida["usuario"] = {
                    "id": transaccion["id_usuario"]
                }
            except Exception as e:
                pass

        if "id_cuenta_origen" in transaccion and transaccion["id_cuenta_origen"]:
            cuenta_origen = self.repositorioCuenta.findById(transaccion["id_cuenta_origen"])
            if cuenta_origen:
                transaccion_enriquecida["cuenta_origen"] = cuenta_origen

        if "id_cuenta_destino" in transaccion and transaccion["id_cuenta_destino"]:
            cuenta_destino = self.repositorioCuenta.findById(transaccion["id_cuenta_destino"])
            if cuenta_destino:
                transaccion_enriquecida["cuenta_destino"] = cuenta_destino

        if "id_bolsillo_origen" in transaccion and transaccion["id_bolsillo_origen"]:
            bolsillo_origen = self.repositorioBolsillo.findById(transaccion["id_bolsillo_origen"])
            if bolsillo_origen:
                transaccion_enriquecida["bolsillo_origen"] = bolsillo_origen

        if "id_bolsillo_destino" in transaccion and transaccion["id_bolsillo_destino"]:
            bolsillo_destino = self.repositorioBolsillo.findById(transaccion["id_bolsillo_destino"])
            if bolsillo_destino:
                transaccion_enriquecida["bolsillo_destino"] = bolsillo_destino

        return transaccion_enriquecida

    def crear(self, infoTransaccion):
        monto = infoTransaccion["monto"]

        tipo_movimiento = self.repositorioTipoMovimiento.findById(infoTransaccion["id_tipo_movimiento"])
        if not tipo_movimiento:
            return {"error": "Tipo de movimiento no válido"}, 400

        origen = tipo_movimiento["codigo_origen"].upper()
        destino = tipo_movimiento["codigo_destino"].upper()

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

    def _transferenciaCuentaCuenta(self, infoTransaccion, monto):
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

        if not cuenta_origen_id or not cuenta_destino_id:
            return {"error": "Faltan cuentas origen o destino"}, 400

        cuenta_origen_data = self.repositorioCuenta.findById(cuenta_origen_id)
        cuenta_destino_data = self.repositorioCuenta.findById(cuenta_destino_id)

        if not cuenta_origen_data or not cuenta_destino_data:
            return {"error": "Cuenta origen o destino no encontrada"}, 404

        if not isinstance(cuenta_origen_data.get("saldo"), (int, float)) or cuenta_origen_data["saldo"] < monto:
            return {"error": "Saldo insuficiente en la cuenta origen"}, 400

        uuid = infoTransaccion.get("uuid_transaccion")
        if uuid:
            existe = self.repositorioTransaccion.query({"uuid_transaccion": uuid})
            if existe:
                return {"error": "Esta transacción ya fue registrada previamente"}, 409

        nueva_transaccion_data = infoTransaccion.copy()
        if "id_usuario" not in nueva_transaccion_data:
            nueva_transaccion_data["id_usuario"] = (
                    cuenta_origen_data.get("usuario_id") or
                    cuenta_origen_data.get("userId")
            )

        cuenta_origen = Cuenta(cuenta_origen_data)
        cuenta_destino = Cuenta(cuenta_destino_data)
        cuenta_origen.saldo -= monto
        cuenta_destino.saldo += monto

        self.repositorioCuenta.save(cuenta_origen)
        self.repositorioCuenta.save(cuenta_destino)

        nueva_transaccion = Transaccion(nueva_transaccion_data)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)

        return resultado

    def _retiroBolsilloBanco(self, infoTransaccion, monto):
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

        uuid = infoTransaccion.get("uuid_transaccion")
        if uuid:
            existe = self.repositorioTransaccion.query({"uuid_transaccion": uuid})
            if existe:
                return {"error": "Esta transacción ya fue registrada previamente"}, 409

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

        bolsillo_origen.saldo -= monto
        self.repositorioBolsillo.save(bolsillo_origen)

        nueva_transaccion = Transaccion(nueva_transaccion_data)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)

        return resultado

    def _transferenciaBolsilloBolsillo(self, infoTransaccion, monto):
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

        uuid = infoTransaccion.get("uuid_transaccion")
        if uuid:
            existe = self.repositorioTransaccion.query({"uuid_transaccion": uuid})
            if existe:
                return {"error": "Esta transacción ya fue registrada previamente"}, 409

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

        bolsillo_origen.saldo -= monto
        bolsillo_destino.saldo += monto

        self.repositorioBolsillo.save(bolsillo_origen)
        self.repositorioBolsillo.save(bolsillo_destino)

        nueva_transaccion = Transaccion(nueva_transaccion_data)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)

        return resultado

    def _transferenciaCuentaBolsillo(self, infoTransaccion, monto):
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

        uuid = infoTransaccion.get("uuid_transaccion")
        if uuid:
            existe = self.repositorioTransaccion.query({"uuid_transaccion": uuid})
            if existe:
                return {"error": "Esta transacción ya fue registrada previamente"}, 409

        nueva_transaccion_data = infoTransaccion.copy()
        nueva_transaccion_data["descripcion"] = descripcion

        if "id_usuario" not in nueva_transaccion_data:
            nueva_transaccion_data["id_usuario"] = (
                    cuenta_origen_data.get("usuario_id") or cuenta_origen_data.get("userId")
            )

        cuenta_origen.saldo -= monto
        bolsillo_destino.saldo += monto

        self.repositorioCuenta.save(cuenta_origen)
        self.repositorioBolsillo.save(bolsillo_destino)

        nueva_transaccion = Transaccion(nueva_transaccion_data)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)

        return resultado

    def _retiroCuentaBanco(self, infoTransaccion, monto):
        campos_requeridos = [
            "id_cuenta_origen", "id_tipo_movimiento", "id_tipo_transaccion",
            "descripcion", "uuid_transaccion", "monto"
        ]
        faltantes = [campo for campo in campos_requeridos if campo not in infoTransaccion]
        if faltantes:
            return {"error": f"Faltan campos requeridos: {', '.join(faltantes)}"}, 422

        cuenta_origen_id = infoTransaccion.get("id_cuenta_origen")
        descripcion = infoTransaccion.get("descripcion", "").strip()

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

        uuid = infoTransaccion.get("uuid_transaccion")
        if uuid:
            existe = self.repositorioTransaccion.query({"uuid_transaccion": uuid})
            if existe:
                return {"error": "Esta transacción ya fue registrada previamente"}, 409

        nueva_transaccion_data = infoTransaccion.copy()
        nueva_transaccion_data["descripcion"] = descripcion

        if "id_usuario" not in nueva_transaccion_data:
            nueva_transaccion_data["id_usuario"] = (
                    cuenta_origen_data.get("usuario_id") or cuenta_origen_data.get("userId")
            )

        cuenta_origen.saldo -= monto
        self.repositorioCuenta.save(cuenta_origen)

        nueva_transaccion = Transaccion(nueva_transaccion_data)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)

        return resultado

    def _consignacionBancoCuenta(self, infoTransaccion, monto):
        campos_requeridos = [
            "id_cuenta_destino", "id_tipo_movimiento", "id_tipo_transaccion",
            "descripcion", "uuid_transaccion", "monto"
        ]
        faltantes = [campo for campo in campos_requeridos if campo not in infoTransaccion]
        if faltantes:
            return {"error": f"Faltan campos requeridos: {', '.join(faltantes)}"}, 422

        cuenta_destino_id = infoTransaccion.get("id_cuenta_destino")
        descripcion = infoTransaccion.get("descripcion", "").strip()

        try:
            monto = float(monto)
        except (TypeError, ValueError):
            return {"error": "El monto debe ser un número válido"}, 400

        if not cuenta_destino_id:
            return {"error": "Falta id_cuenta_destino en la transacción"}, 400

        cuenta_destino_data = self.repositorioCuenta.findById(cuenta_destino_id)
        if not cuenta_destino_data:
            return {"error": "Cuenta destino no encontrada"}, 404

        uuid = infoTransaccion.get("uuid_transaccion")
        if uuid:
            existe = self.repositorioTransaccion.query({"uuid_transaccion": uuid})
            if existe:
                return {"error": "Esta transacción ya fue registrada previamente"}, 409

        nueva_transaccion_data = infoTransaccion.copy()
        nueva_transaccion_data["descripcion"] = descripcion

        if "id_usuario" not in nueva_transaccion_data:
            nueva_transaccion_data["id_usuario"] = (
                    cuenta_destino_data.get("usuario_id") or cuenta_destino_data.get("userId")
            )

        cuenta_destino = Cuenta(cuenta_destino_data)
        cuenta_destino.saldo += monto
        self.repositorioCuenta.save(cuenta_destino)

        nueva_transaccion = Transaccion(nueva_transaccion_data)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)

        return resultado

    def _consignacionBancoBolsillo(self, infoTransaccion, monto):
        campos_requeridos = [
            "id_bolsillo_destino", "id_tipo_movimiento", "id_tipo_transaccion",
            "descripcion", "uuid_transaccion", "monto"
        ]
        faltantes = [campo for campo in campos_requeridos if campo not in infoTransaccion]
        if faltantes:
            return {"error": f"Faltan campos requeridos: {', '.join(faltantes)}"}, 422

        id_bolsillo_destino = infoTransaccion.get("id_bolsillo_destino")
        descripcion = infoTransaccion.get("descripcion", "").strip()

        try:
            monto = float(monto)
        except (TypeError, ValueError):
            return {"error": "El monto debe ser un número válido"}, 400

        if not id_bolsillo_destino:
            return {"error": "Falta id_bolsillo_destino en la transacción"}, 400

        bolsillo_destino_data = self.repositorioBolsillo.findById(id_bolsillo_destino)
        if not bolsillo_destino_data:
            return {"error": "Bolsillo destino no encontrado"}, 404

        uuid = infoTransaccion.get("uuid_transaccion")
        if uuid:
            existe = self.repositorioTransaccion.query({"uuid_transaccion": uuid})
            if existe:
                return {"error": "Esta transacción ya fue registrada previamente"}, 409

        nueva_transaccion_data = infoTransaccion.copy()
        nueva_transaccion_data["descripcion"] = descripcion

        if "id_usuario" not in nueva_transaccion_data:
            cuenta_data = None
            if "id_cuenta" in bolsillo_destino_data:
                cuenta_data = self.repositorioCuenta.findById(bolsillo_destino_data["id_cuenta"])
            if cuenta_data:
                nueva_transaccion_data["id_usuario"] = (
                        cuenta_data.get("usuario_id") or cuenta_data.get("userId")
                )

        bolsillo_destino = Bolsillo(bolsillo_destino_data)
        bolsillo_destino.saldo += monto
        self.repositorioBolsillo.save(bolsillo_destino)

        nueva_transaccion = Transaccion(nueva_transaccion_data)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)

        return resultado

    def actualizar(self, id, infoTransaccion):
        transaccion_actual = self.repositorioTransaccion.findById(id)

        if not transaccion_actual:
            return {"error": "Transacción no encontrada"}, 404

        if isinstance(transaccion_actual, dict):
            transaccion_actual = Transaccion(transaccion_actual)

        transaccion_actual.descripcion = infoTransaccion.get("descripcion", transaccion_actual.descripcion)
        transaccion_actual.fecha_transaccion = infoTransaccion.get("fecha_transaccion", transaccion_actual.fecha_transaccion)

        if "estado" in infoTransaccion:
            transaccion_actual.estado = infoTransaccion["estado"]

        resultado = self.repositorioTransaccion.save(transaccion_actual)
        return resultado

    def anular(self, id, reintegrar_fondos=True):
        transaccion_data = self.repositorioTransaccion.findById(id)
        if not transaccion_data:
            return {"error": "Transacción no encontrada"}, 404

        transaccion_eliminada = transaccion_data.copy()

        if "estado" in transaccion_data and transaccion_data["estado"] == "ANULADA":
            return {"message": "La transacción ya estaba anulada", "transaccion": transaccion_data}

        monto = transaccion_data.get("monto", 0)
        if not monto:
            monto = 0

        resultado_actualizar = None

        try:
            if reintegrar_fondos:
                if isinstance(monto, str):
                    monto = float(monto)

                if "id_cuenta_origen" in transaccion_data and "id_cuenta_destino" in transaccion_data:
                    cuenta_origen_id = transaccion_data["id_cuenta_origen"]
                    cuenta_destino_id = transaccion_data["id_cuenta_destino"]

                    cuenta_origen_data = self.repositorioCuenta.findById(cuenta_origen_id)
                    cuenta_destino_data = self.repositorioCuenta.findById(cuenta_destino_id)

                    if cuenta_origen_data and cuenta_destino_data:
                        cuenta_origen = Cuenta(cuenta_origen_data)
                        cuenta_destino = Cuenta(cuenta_destino_data)

                        if isinstance(cuenta_origen.saldo, str):
                            cuenta_origen.saldo = float(cuenta_origen.saldo)
                        if isinstance(cuenta_destino.saldo, str):
                            cuenta_destino.saldo = float(cuenta_destino.saldo)

                        cuenta_origen.saldo = float(cuenta_origen.saldo) + float(monto)
                        cuenta_destino.saldo = float(cuenta_destino.saldo) - float(monto)

                        self.repositorioCuenta.save(cuenta_origen)
                        self.repositorioCuenta.save(cuenta_destino)

                elif "id_cuenta_origen" in transaccion_data and "id_bolsillo_destino" in transaccion_data:
                    cuenta_origen_id = transaccion_data["id_cuenta_origen"]
                    bolsillo_destino_id = transaccion_data["id_bolsillo_destino"]

                    cuenta_origen_data = self.repositorioCuenta.findById(cuenta_origen_id)
                    bolsillo_destino_data = self.repositorioBolsillo.findById(bolsillo_destino_id)

                    if cuenta_origen_data and bolsillo_destino_data:
                        cuenta_origen = Cuenta(cuenta_origen_data)
                        bolsillo_destino = Bolsillo(bolsillo_destino_data)

                        if isinstance(cuenta_origen.saldo, str):
                            cuenta_origen.saldo = float(cuenta_origen.saldo)
                        if isinstance(bolsillo_destino.saldo, str):
                            bolsillo_destino.saldo = float(bolsillo_destino.saldo)

                        cuenta_origen.saldo = float(cuenta_origen.saldo) + float(monto)
                        bolsillo_destino.saldo = float(bolsillo_destino.saldo) - float(monto)

                        self.repositorioCuenta.save(cuenta_origen)
                        self.repositorioBolsillo.save(bolsillo_destino)

                elif "id_bolsillo_origen" in transaccion_data and "id_cuenta_destino" in transaccion_data:
                    bolsillo_origen_id = transaccion_data["id_bolsillo_origen"]
                    cuenta_destino_id = transaccion_data["id_cuenta_destino"]

                    bolsillo_origen_data = self.repositorioBolsillo.findById(bolsillo_origen_id)
                    cuenta_destino_data = self.repositorioCuenta.findById(cuenta_destino_id)

                    if bolsillo_origen_data and cuenta_destino_data:
                        bolsillo_origen = Bolsillo(bolsillo_origen_data)
                        cuenta_destino = Cuenta(cuenta_destino_data)

                        if isinstance(bolsillo_origen.saldo, str):
                            bolsillo_origen.saldo = float(bolsillo_origen.saldo)
                        if isinstance(cuenta_destino.saldo, str):
                            cuenta_destino.saldo = float(cuenta_destino.saldo)

                        bolsillo_origen.saldo = float(bolsillo_origen.saldo) + float(monto)
                        cuenta_destino.saldo = float(cuenta_destino.saldo) - float(monto)

                        self.repositorioBolsillo.save(bolsillo_origen)
                        self.repositorioCuenta.save(cuenta_destino)

                elif "id_bolsillo_origen" in transaccion_data and "id_bolsillo_destino" in transaccion_data:
                    bolsillo_origen_id = transaccion_data["id_bolsillo_origen"]
                    bolsillo_destino_id = transaccion_data["id_bolsillo_destino"]

                    bolsillo_origen_data = self.repositorioBolsillo.findById(bolsillo_origen_id)
                    bolsillo_destino_data = self.repositorioBolsillo.findById(bolsillo_destino_id)

                    if bolsillo_origen_data and bolsillo_destino_data:
                        bolsillo_origen = Bolsillo(bolsillo_origen_data)
                        bolsillo_destino = Bolsillo(bolsillo_destino_data)

                        if isinstance(bolsillo_origen.saldo, str):
                            bolsillo_origen.saldo = float(bolsillo_origen.saldo)
                        if isinstance(bolsillo_destino.saldo, str):
                            bolsillo_destino.saldo = float(bolsillo_destino.saldo)

                        bolsillo_origen.saldo = float(bolsillo_origen.saldo) + float(monto)
                        bolsillo_destino.saldo = float(bolsillo_destino.saldo) - float(monto)

                        self.repositorioBolsillo.save(bolsillo_origen)
                        self.repositorioBolsillo.save(bolsillo_destino)

            transaccion = Transaccion(transaccion_data)
            transaccion.estado = "ANULADA"
            resultado_actualizar = self.repositorioTransaccion.save(transaccion)

            return {
                "message": "Transacción anulada correctamente y dinero reintegrado",
                "transaccion": resultado_actualizar,
                "anulada": True
            }

        except Exception as e:
            return {"error": f"Error al anular la transacción: {str(e)}"}, 500
