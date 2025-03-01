from Repositorios.RepositorioCuenta import RepositorioCuenta
from Repositorios.RepositorioBolsillo import RepositorioBolsillo
from Modelos.Cuenta import Cuenta
from Modelos.Bolsillo import Bolsillo

class ControladorCuenta():
    def __init__(self):
        self.repositorioCuenta = RepositorioCuenta()
        self.repositorioBolsillo = RepositorioBolsillo()

    def index(self):
        cuentas = self.repositorioCuenta.findAll()

        for cuenta in cuentas:
            cuenta["usuario_id"] = cuenta.get("usuario_id", None)
            cuenta["id_bolsillo"] = cuenta.get("id_bolsillo", None)

            # ✅ Si la cuenta tiene un bolsillo asignado, obtenemos su información
            if cuenta["id_bolsillo"]:
                bolsillo = self.repositorioBolsillo.findById(cuenta["id_bolsillo"])
                if bolsillo:
                    cuenta["bolsillo"] = bolsillo  # 🔹 Agregamos los datos completos del bolsillo

        print(f"🔹 Cuentas obtenidas con Bolsillos: {cuentas}")  # ✅ Verifica en consola los resultados
        return cuentas

    def create(self, infoCuenta):
        nuevaCuenta = Cuenta(infoCuenta)
        nuevaCuenta.usuario_id = None
        nuevaCuenta.id_bolsillo = None

        cuenta_guardada = self.repositorioCuenta.save(nuevaCuenta)

        cuenta_guardada["usuario_id"] = cuenta_guardada.get("usuario_id", None)
        cuenta_guardada["id_bolsillo"] = cuenta_guardada.get("id_bolsillo", None)

        return cuenta_guardada

    def show(self, id):
        cuentaActual = self.repositorioCuenta.findById(id)
        if not cuentaActual:
            return {"error": "Cuenta no encontrada"}, 404

        # ✅ Aseguramos que id_bolsillo y usuario_id estén en la respuesta
        cuentaActual["usuario_id"] = cuentaActual.get("usuario_id", None)
        cuentaActual["id_bolsillo"] = cuentaActual.get("id_bolsillo", None)

        print(f"🔹 Cuenta encontrada: {cuentaActual}")  # ✅ Verificar que encontramos la cuenta

        # ✅ Si tiene un bolsillo asignado, buscamos la información del bolsillo
        if cuentaActual["id_bolsillo"]:
            bolsillo = self.repositorioBolsillo.findById(cuentaActual["id_bolsillo"])
            print(f"🔹 Bolsillo encontrado: {bolsillo}")  # ✅ Verificamos si encuentra el bolsillo

            if bolsillo:
                cuentaActual["bolsillo"] = bolsillo  # ✅ Agregamos la información completa del bolsillo

        print(f"🔹 Respuesta final de show(): {cuentaActual}")  # ✅ Verificar respuesta final
        return cuentaActual

    def update(self, id, infoCuenta):
        cuentaActual = self.repositorioCuenta.findById(id)

        if cuentaActual is None:
            return {"error": "Cuenta no encontrada"}, 404  # 🔹 Manejo de error

        cuentaObjeto = Cuenta(cuentaActual)  # 🔹 Asegura que no se llame si cuentaActual es None

        cuentaObjeto.color = infoCuenta.get("color", cuentaObjeto.color)
        cuentaObjeto.fecha_creacion = infoCuenta.get("fecha_creacion", cuentaObjeto.fecha_creacion)
        cuentaObjeto.meta_ahorro = infoCuenta.get("meta_ahorro", cuentaObjeto.meta_ahorro)
        cuentaObjeto.saldo = infoCuenta.get("saldo", cuentaObjeto.saldo)
        cuentaObjeto.nombre = infoCuenta.get("nombre", cuentaObjeto.nombre)
        cuentaObjeto.numero_cuenta = infoCuenta.get("numero_cuenta", cuentaObjeto.numero_cuenta)

        return self.repositorioCuenta.save(cuentaObjeto)

    def delete(self, id):
        return self.repositorioCuenta.delete(id)

    def actualizarSaldo(self, id_cuenta, nuevo_saldo):
        cuentaActual = self.repositorioCuenta.findById(id_cuenta)
        if cuentaActual:
            cuentaActual["saldo"] = nuevo_saldo
            return self.repositorioCuenta.save(Cuenta(cuentaActual))
        return {"error": "Cuenta no encontrada"}, 404
