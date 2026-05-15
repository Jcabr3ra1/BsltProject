from Repositorios.RepositorioCuenta import RepositorioCuenta
from Repositorios.RepositorioBolsillo import RepositorioBolsillo
from Modelos.Cuenta import Cuenta
import requests
import random
import string
from datetime import datetime
import json

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
        if "numero_cuenta" not in info_cuenta or not info_cuenta["numero_cuenta"]:
            info_cuenta["numero_cuenta"] = self._generar_numero_cuenta()

        if "tipo" not in info_cuenta:
            info_cuenta["tipo"] = "CUENTA_CORRIENTE"

        if "saldo" not in info_cuenta:
            info_cuenta["saldo"] = 0.0

        usuario_id = None
        if "usuario_id" in info_cuenta and info_cuenta["usuario_id"]:
            usuario_id = info_cuenta["usuario_id"]
        elif "userId" in info_cuenta and info_cuenta["userId"]:
            usuario_id = info_cuenta["userId"]
        elif "id_usuario" in info_cuenta and info_cuenta["id_usuario"]:
            usuario_id = info_cuenta["id_usuario"]

        if usuario_id:
            info_cuenta["usuario_id"] = usuario_id
            info_cuenta["userId"] = usuario_id
            info_cuenta["id_usuario"] = usuario_id

        nueva_cuenta = Cuenta(info_cuenta)
        nueva_cuenta.createdAt = datetime.now().isoformat()
        nueva_cuenta.updatedAt = datetime.now().isoformat()
        nueva_cuenta.id_bolsillo = None

        if usuario_id:
            nueva_cuenta.usuario_id = usuario_id

        numero_existente = self.repositorioCuenta.query({"numero_cuenta": nueva_cuenta.numero_cuenta})
        if numero_existente:
            return {"error": "Ya existe una cuenta con ese número de cuenta"}, 400

        cuenta_guardada = self.repositorioCuenta.save(nueva_cuenta)

        cuenta_guardada["usuario_id"] = cuenta_guardada.get("usuario_id", usuario_id)
        cuenta_guardada["id_usuario"] = cuenta_guardada.get("id_usuario", usuario_id)
        cuenta_guardada["userId"] = cuenta_guardada.get("userId", usuario_id)
        cuenta_guardada["id_bolsillo"] = cuenta_guardada.get("id_bolsillo", None)

        if usuario_id:
            self._notificar_seguridad_asociacion(cuenta_guardada["_id"], usuario_id)

        cuenta_guardada["_id"] = str(cuenta_guardada["_id"])
        return cuenta_guardada

    def _generar_numero_cuenta(self):
        digitos = string.digits
        numero = ''.join(random.choice(digitos) for _ in range(10))

        while self.repositorioCuenta.query({"numero_cuenta": numero}):
            numero = ''.join(random.choice(digitos) for _ in range(10))

        return numero

    def _notificar_seguridad_asociacion(self, id_cuenta, id_usuario, auth_token=None):
        try:
            with open("Config/config.json", "r") as archivo_config:
                configuracion = json.load(archivo_config)

            seguridad_url = configuracion.get('servicios', {}).get('seguridad', 'http://localhost:7777')
            url_completa = f"{seguridad_url}/usuarios/{id_usuario}/cuentas/{id_cuenta}"

            headers = {
                "Content-Type": "application/json"
            }

            if auth_token:
                headers["Authorization"] = auth_token

            response = requests.put(url_completa, json={}, headers=headers, timeout=5)

            if response.status_code in [200, 201, 204]:
                return True
            else:
                return False
        except Exception as e:
            return False

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

        if "numero_cuenta" in info_cuenta:
            cuenta_objeto.numero_cuenta = info_cuenta["numero_cuenta"]

        if "tipo" in info_cuenta:
            cuenta_objeto.tipo = info_cuenta["tipo"]

        if "saldo" in info_cuenta:
            cuenta_objeto.saldo = info_cuenta["saldo"]

        if "nombre" in info_cuenta:
            cuenta_objeto.nombre = info_cuenta["nombre"]

        if "color" in info_cuenta:
            cuenta_objeto.color = info_cuenta["color"]

        if "meta_ahorro" in info_cuenta:
            cuenta_objeto.meta_ahorro = info_cuenta["meta_ahorro"]

        if "usuario_id" in info_cuenta and info_cuenta["usuario_id"]:
            cuenta_objeto.usuario_id = info_cuenta["usuario_id"]
        elif "userId" in info_cuenta and info_cuenta["userId"]:
            cuenta_objeto.usuario_id = info_cuenta["userId"]
        elif "id_usuario" in info_cuenta and info_cuenta["id_usuario"]:
            cuenta_objeto.usuario_id = info_cuenta["id_usuario"]

        cuenta_objeto.updatedAt = datetime.now().isoformat()

        cuenta_actualizada = self.repositorioCuenta.save(cuenta_objeto)

        return cuenta_actualizada

    def eliminar(self, id):
        cuenta = self.repositorioCuenta.findById(id)
        if not cuenta:
            return {"mensaje": "Cuenta no encontrada"}, 404

        usuario_id = cuenta.get("usuario_id")
        if usuario_id:
            try:
                with open("Config/config.json", "r") as archivo_config:
                    configuracion = json.load(archivo_config)
                seguridad_url = configuracion.get('servicios', {}).get('seguridad', 'http://localhost:7777')
                requests.put(f"{seguridad_url}/usuarios/{usuario_id}/cuentas/desasociar/{id}")
            except Exception as e:
                pass

        id_bolsillo = cuenta.get("id_bolsillo")
        if id_bolsillo:
            try:
                self.repositorioBolsillo.delete(id_bolsillo)
            except Exception as e:
                pass

        return self.repositorioCuenta.delete(id)

    def asignar_usuario_a_cuenta(self, id_cuenta, id_usuario, auth_token=None):
        cuenta_actual = self.repositorioCuenta.findById(id_cuenta)
        if cuenta_actual.get("usuario_id"):
            raise Exception("La cuenta ya está asignada a un usuario.")

        cuenta_actual = self.repositorioCuenta.findById(id_cuenta)
        if not cuenta_actual:
            return {"error": "Cuenta no encontrada"}, 404

        if cuenta_actual.get("usuario_id") and cuenta_actual["usuario_id"] != id_usuario:
            return {"error": "La cuenta ya está asignada a otro usuario."}, 400

        if cuenta_actual.get("usuario_id") == id_usuario:
            return cuenta_actual

        cuenta_objeto = Cuenta(cuenta_actual)
        cuenta_objeto.usuario_id = id_usuario
        cuenta_objeto.id_usuario = id_usuario
        cuenta_objeto.userId = id_usuario
        cuenta_objeto.updatedAt = datetime.now().isoformat()

        cuenta_guardada = self.repositorioCuenta.save(cuenta_objeto)

        self._notificar_seguridad_asociacion(id_cuenta, id_usuario, auth_token)

        return cuenta_guardada

    def obtener_por_usuario(self, id_usuario):
        try:
            consultas = [
                {"usuario_id": id_usuario},
                {"userId": id_usuario},
                {"id_usuario": id_usuario}
            ]

            cuentas_encontradas = []
            for consulta in consultas:
                resultado = self.repositorioCuenta.query(consulta)
                cuentas_encontradas.extend(resultado)

            cuentas_unicas = []
            ids_vistos = set()
            for cuenta in cuentas_encontradas:
                cuenta_id = cuenta.get('_id')
                if cuenta_id not in ids_vistos:
                    ids_vistos.add(cuenta_id)
                    cuentas_unicas.append(cuenta)

            return cuentas_unicas

        except Exception as e:
            return []
