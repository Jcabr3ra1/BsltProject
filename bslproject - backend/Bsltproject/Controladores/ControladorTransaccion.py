from Modelos.Bolsillo import Bolsillo
from Modelos.Cuenta import Cuenta
from Repositorios.RepositorioTransaccion import RepositorioTransaccion
from Repositorios.RepositorioCuenta import RepositorioCuenta
from Repositorios.RepositorioBolsillo import RepositorioBolsillo
from Repositorios.RepositorioTipoMovimiento import RepositorioTipoMovimiento
from Modelos.Transaccion import Transaccion


class ControladorTransaccion():
    def __init__(self):
        self.repositorioTransaccion = RepositorioTransaccion()
        self.repositorioCuenta = RepositorioCuenta()
        self.repositorioBolsillo = RepositorioBolsillo()
        self.repositorioTipoMovimiento = RepositorioTipoMovimiento()

    def obtenerTodas(self):
        transacciones = self.repositorioTransaccion.findAll()
        print("Transacciones encontradas:", transacciones)  # <-- Agrega esto
        return transacciones

    def obtenerPorId(self, id):
        transaccion = self.repositorioTransaccion.findById(id)
        if transaccion:
            return transaccion
        return {"error": "Transacción no encontrada"}, 404

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
        cuenta_origen = Cuenta(cuenta_origen_data) if cuenta_origen_data else None

        if not cuenta_origen:
            return {"error": "Cuenta origen no encontrada"}, 404

        if cuenta_origen.saldo < monto:
            return {"error": "Saldo insuficiente en la cuenta"}, 400

        cuenta_origen.saldo -= monto

        # Pasamos directamente el objeto en lugar de usar `vars`
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

        print(f"✅ Consignación: Nuevo saldo en cuenta {cuenta_destino._id}: {cuenta_destino.saldo}")  # Debug

        self.repositorioCuenta.save(cuenta_destino)  # ✅ Ahora sí guardamos correctamente

        nueva_transaccion = Transaccion(infoTransaccion)
        resultado = self.repositorioTransaccion.save(nueva_transaccion)

        return resultado

    def _retiroCuentaBanco(self, infoTransaccion, monto):
        cuenta_origen_data = self.repositorioCuenta.findById(infoTransaccion["id_cuenta_origen"])

        if not cuenta_origen_data:
            return {"error": "Cuenta origen no encontrada"}, 404

        # ✅ Convertimos a objeto Cuenta
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

    """
    🔹 Actualizar una transacción
    """

    def actualizar(self, id, infoTransaccion):
        transaccionActual = self.repositorioTransaccion.findById(id)
        if not transaccionActual:
            return {"error": "Transacción no encontrada"}, 404

        transaccionActual.descripcion = infoTransaccion.get("descripcion", transaccionActual["descripcion"])
        transaccionActual.fecha_transaccion = infoTransaccion.get("fecha_transaccion", transaccionActual["fecha_transaccion"])
        transaccionActual.monto = infoTransaccion.get("monto", transaccionActual["monto"])

        return self.repositorioTransaccion.save(transaccionActual)

    """
    🔹 Eliminar una transacción
    """

    def eliminar(self, id):
        return self.repositorioTransaccion.delete(id)
