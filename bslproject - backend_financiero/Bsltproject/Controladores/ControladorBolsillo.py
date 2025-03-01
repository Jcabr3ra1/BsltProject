from Repositorios.RepositorioBolsillo import RepositorioBolsillo
from Repositorios.RepositorioCuenta import RepositorioCuenta
from Modelos.Bolsillo import Bolsillo
from Modelos.Cuenta import Cuenta

class ControladorBolsillo():
    def __init__(self):
        self.repositorioBolsillo = RepositorioBolsillo()
        self.repositorioCuenta = RepositorioCuenta()

    def index(self):
        return self.repositorioBolsillo.findAll()

    def create(self, infoBolsillo):
        nuevoBolsillo = Bolsillo(infoBolsillo)
        nuevoBolsillo.id_cuenta = None  # Siempre aseguramos que esté en None por defecto

        bolsillo_guardado = self.repositorioBolsillo.save(nuevoBolsillo)
        bolsillo_guardado["id_cuenta"] = bolsillo_guardado.get("id_cuenta", None)

        return bolsillo_guardado

    def show(self, id):
        bolsilloActual = self.repositorioBolsillo.findById(id)
        if bolsilloActual:
            if "id_cuenta" not in bolsilloActual:
                bolsilloActual["id_cuenta"] = None
            return bolsilloActual
        return {"error": "Bolsillo no encontrado"}, 404

    def update(self, id, infoBolsillo):
        bolsilloActual = self.repositorioBolsillo.findById(id)
        if not bolsilloActual:
            return {"error": "Bolsillo no encontrado"}, 404

        bolsilloObjeto = Bolsillo(bolsilloActual)
        bolsilloObjeto.color = infoBolsillo.get("color", bolsilloObjeto.color)
        bolsilloObjeto.nombre = infoBolsillo.get("nombre", bolsilloObjeto.nombre)
        bolsilloObjeto.saldo = infoBolsillo.get("saldo", bolsilloObjeto.saldo)

        return self.repositorioBolsillo.save(bolsilloObjeto)

    def delete(self, id):
        return self.repositorioBolsillo.delete(id)

    """
    🔹 Asignar un bolsillo a una cuenta
    """
    def asignarCuenta(self, id_bolsillo, id_cuenta):
        bolsilloActual = self.repositorioBolsillo.findById(id_bolsillo)
        cuentaActual = self.repositorioCuenta.findById(id_cuenta)

        if not bolsilloActual:
            return {"error": "Bolsillo no encontrado"}, 404

        if not cuentaActual:
            return {"error": "Cuenta no encontrada"}, 404

        bolsilloObjeto = Bolsillo(bolsilloActual)
        cuentaObjeto = Cuenta(cuentaActual)

        bolsilloObjeto.id_cuenta = id_cuenta
        bolsillo_guardado = self.repositorioBolsillo.save(bolsilloObjeto)

        cuentaObjeto.id_bolsillo = id_bolsillo  # Actualizar también la cuenta
        cuenta_guardada = self.repositorioCuenta.save(cuentaObjeto)

        return {
            "bolsillo_actualizado": bolsillo_guardado,
            "cuenta_actualizada": cuenta_guardada
        }

    """
    🔹 Actualizar saldo de un bolsillo después de una transacción
    """
    def actualizarSaldo(self, id_bolsillo, nuevo_saldo):
        bolsilloActual = self.repositorioBolsillo.findById(id_bolsillo)
        if bolsilloActual:
            bolsilloActual["saldo"] = nuevo_saldo
            return self.repositorioBolsillo.save(Bolsillo(bolsilloActual))
        return {"error": "Bolsillo no encontrado"}, 404
