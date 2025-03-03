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

    def crear(self, infoBolsillo):
        nuevo_bolsillo = Bolsillo(infoBolsillo)
        nuevo_bolsillo.id_cuenta = None  # Siempre aseguramos que esté en None por defecto

        bolsillo_guardado = self.repositorioBolsillo.save(nuevo_bolsillo)
        bolsillo_guardado["id_cuenta"] = bolsillo_guardado.get("id_cuenta", None)

        return bolsillo_guardado

    def obtener_por_id(self, id):
        bolsillo = self.repositorioBolsillo.findById(id)
        if bolsillo:
            bolsillo["id_cuenta"] = bolsillo.get("id_cuenta", None)
            return bolsillo
        return {"error": "Bolsillo no encontrado"}, 404

    def actualizar(self, id, infoBolsillo):
        bolsillo_actual = self.repositorioBolsillo.findById(id)
        if not bolsillo_actual:
            return {"error": "Bolsillo no encontrado"}, 404

        bolsillo_objeto = Bolsillo(bolsillo_actual)
        bolsillo_objeto.color = infoBolsillo.get("color", bolsillo_objeto.color)
        bolsillo_objeto.nombre = infoBolsillo.get("nombre", bolsillo_objeto.nombre)
        bolsillo_objeto.saldo = infoBolsillo.get("saldo", bolsillo_objeto.saldo)

        return self.repositorioBolsillo.save(bolsillo_objeto)

    def eliminar(self, id):
        return self.repositorioBolsillo.delete(id)

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
