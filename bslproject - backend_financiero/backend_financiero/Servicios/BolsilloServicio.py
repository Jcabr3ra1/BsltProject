from Repositorios.RepositorioBolsillo import RepositorioBolsillo
from Repositorios.RepositorioCuenta import RepositorioCuenta
from Modelos.Bolsillo import Bolsillo
from Modelos.Cuenta import Cuenta

class BolsilloServicio:
    def __init__(self):
        self.repositorioBolsillo = RepositorioBolsillo()
        self.repositorioCuenta = RepositorioCuenta()

    def obtener_todos(self):
        return self.repositorioBolsillo.findAll()

    def crear(self, info_bolsillo: dict):
        id_cuenta = info_bolsillo.get("id_cuenta")
        valor = float(info_bolsillo.get("saldo", 0))

        if not id_cuenta:
            return {"mensaje": "El bolsillo debe estar asociado a una cuenta"}, 400
        if valor <= 0:
            return {"mensaje": "El valor del bolsillo debe ser mayor que 0"}, 400

        cuenta = self.repositorioCuenta.findById(id_cuenta)
        if not cuenta:
            return {"mensaje": "Cuenta no encontrada"}, 404

        saldo_actual = cuenta.get("saldo", 0)
        if saldo_actual < valor:
            return {"mensaje": "Saldo insuficiente en la cuenta"}, 400

        cuenta["saldo"] = round(saldo_actual - valor, 2)
        self.repositorioCuenta.save(Cuenta(cuenta))

        info_bolsillo["saldo"] = round(valor, 2)
        bolsillo_creado = self.repositorioBolsillo.save(Bolsillo(info_bolsillo))  # ✅ CORREGIDO
        return bolsillo_creado

    def obtener_por_id(self, id):
        bolsillo = self.repositorioBolsillo.findById(id)
        if not bolsillo:
            return {"error": "Bolsillo no encontrado"}, 404
        bolsillo["id_cuenta"] = bolsillo.get("id_cuenta", None)
        return bolsillo

    def actualizar(self, id, infoBolsillo):
        bolsillo_actual = self.repositorioBolsillo.findById(id)
        if not bolsillo_actual:
            return {"error": "Bolsillo no encontrado"}, 404

        bolsillo_objeto = Bolsillo(bolsillo_actual)

        if "color" in infoBolsillo:
            bolsillo_objeto.color = infoBolsillo["color"]
        if "nombre" in infoBolsillo:
            bolsillo_objeto.nombre = infoBolsillo["nombre"]
        if "saldo" in infoBolsillo:
            bolsillo_objeto.saldo = infoBolsillo["saldo"]

        return self.repositorioBolsillo.save(bolsillo_objeto)

    def eliminar(self, id):
        return self.repositorioBolsillo.delete(id)

    def eliminar_y_quitar_referencia(self, id_bolsillo):
        bolsillo = self.repositorioBolsillo.findById(id_bolsillo)
        if not bolsillo:
            return {"error": "Bolsillo no encontrado"}, 404

        id_cuenta = bolsillo.get("id_cuenta")
        saldo_bolsillo = float(bolsillo.get("saldo", 0))

        # Eliminar bolsillo
        self.repositorioBolsillo.delete(id_bolsillo)

        # Si tiene cuenta asociada, reintegrar saldo
        if id_cuenta:
            cuenta = self.repositorioCuenta.findById(id_cuenta)
            if cuenta:
                cuenta["saldo"] = round(cuenta.get("saldo", 0) + saldo_bolsillo, 2)
                cuenta_objeto = Cuenta(cuenta)
                cuenta_objeto.id_bolsillo = None  # si manejas esta propiedad
                self.repositorioCuenta.save(cuenta_objeto)

        return {"mensaje": "Bolsillo eliminado y saldo reintegrado a la cuenta"}

    def asignar_cuenta(self, id_bolsillo, id_cuenta):
        bolsillo_actual = self.repositorioBolsillo.findById(id_bolsillo)
        cuenta_actual = self.repositorioCuenta.findById(id_cuenta)

        if not bolsillo_actual:
            return {"error": "Bolsillo no encontrado"}, 404
        if not cuenta_actual:
            return {"error": "Cuenta no encontrada"}, 404

        bolsillo_objeto = Bolsillo(bolsillo_actual)
        cuenta_objeto = Cuenta(cuenta_actual)

        bolsillo_objeto.id_cuenta = id_cuenta
        bolsillo_guardado = self.repositorioBolsillo.save(bolsillo_objeto)

        cuenta_objeto.id_bolsillo = id_bolsillo
        cuenta_guardada = self.repositorioCuenta.save(cuenta_objeto)

        return {
            "bolsillo_actualizado": bolsillo_guardado,
            "cuenta_actualizada": cuenta_guardada
        }

    def actualizar_saldo(self, id_bolsillo, nuevo_saldo):
        bolsillo_actual = self.repositorioBolsillo.findById(id_bolsillo)
        if bolsillo_actual:
            bolsillo_actual["saldo"] = nuevo_saldo
            return self.repositorioBolsillo.save(Bolsillo(bolsillo_actual))
        return {"error": "Bolsillo no encontrado"}, 404
