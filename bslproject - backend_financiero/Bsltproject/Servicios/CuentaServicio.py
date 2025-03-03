from Repositorios.RepositorioCuenta import RepositorioCuenta
from Repositorios.RepositorioBolsillo import RepositorioBolsillo
from Modelos.Cuenta import Cuenta

class CuentaServicio:
    def __init__(self):
        self.repositorioCuenta = RepositorioCuenta()
        self.repositorioBolsillo = RepositorioBolsillo()

    def obtener_todas(self):
        cuentas = self.repositorioCuenta.findAll()

        for cuenta in cuentas:
            cuenta["usuario_id"] = cuenta.get("usuario_id", None)
            cuenta["id_bolsillo"] = cuenta.get("id_bolsillo", None)

            if cuenta["id_bolsillo"]:
                bolsillo = self.repositorioBolsillo.findById(cuenta["id_bolsillo"])
                if bolsillo:
                    cuenta["bolsillo"] = bolsillo

        return cuentas

    def crear(self, info_cuenta):
        nueva_cuenta = Cuenta(info_cuenta)
        nueva_cuenta.usuario_id = None
        nueva_cuenta.id_bolsillo = None

        cuenta_guardada = self.repositorioCuenta.save(nueva_cuenta)
        cuenta_guardada["usuario_id"] = cuenta_guardada.get("usuario_id", None)
        cuenta_guardada["id_bolsillo"] = cuenta_guardada.get("id_bolsillo", None)

        return cuenta_guardada

    def obtener_por_id(self, id):
        cuenta_actual = self.repositorioCuenta.findById(id)
        if not cuenta_actual:
            return {"error": "Cuenta no encontrada"}, 404

        cuenta_actual["usuario_id"] = cuenta_actual.get("usuario_id", None)
        cuenta_actual["id_bolsillo"] = cuenta_actual.get("id_bolsillo", None)

        if cuenta_actual["id_bolsillo"]:
            bolsillo = self.repositorioBolsillo.findById(cuenta_actual["id_bolsillo"])
            if bolsillo:
                cuenta_actual["bolsillo"] = bolsillo

        return cuenta_actual

    def actualizar(self, id, info_cuenta):
        cuenta_actual = self.repositorioCuenta.findById(id)

        if not cuenta_actual:
            return {"error": "Cuenta no encontrada"}, 404

        cuenta_objeto = Cuenta(cuenta_actual)
        cuenta_objeto.color = info_cuenta.get("color", cuenta_objeto.color)
        cuenta_objeto.fecha_creacion = info_cuenta.get("fecha_creacion", cuenta_objeto.fecha_creacion)
        cuenta_objeto.meta_ahorro = info_cuenta.get("meta_ahorro", cuenta_objeto.meta_ahorro)
        cuenta_objeto.saldo = info_cuenta.get("saldo", cuenta_objeto.saldo)
        cuenta_objeto.nombre = info_cuenta.get("nombre", cuenta_objeto.nombre)
        cuenta_objeto.numero_cuenta = info_cuenta.get("numero_cuenta", cuenta_objeto.numero_cuenta)

        return self.repositorioCuenta.save(cuenta_objeto)

    def eliminar(self, id):
        return self.repositorioCuenta.delete(id)

    def actualizar_saldo(self, id_cuenta, nuevo_saldo):
        cuenta_actual = self.repositorioCuenta.findById(id_cuenta)
        if cuenta_actual:
            cuenta_actual["saldo"] = nuevo_saldo
            return self.repositorioCuenta.save(Cuenta(cuenta_actual))
        return {"error": "Cuenta no encontrada"}, 404

    def asignar_usuario(self, id_cuenta, id_usuario):
        cuenta_actual = self.repositorioCuenta.findById(id_cuenta)

        if not cuenta_actual:
            return {"error": "Cuenta no encontrada"}, 404

        cuenta_actual["usuario_id"] = id_usuario
        cuenta_actualizada = self.repositorioCuenta.save(Cuenta(cuenta_actual))

        return {"mensaje": "Usuario asignado a la cuenta exitosamente", "cuenta": cuenta_actualizada}
