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
        print(f"Iniciando creación de cuenta con datos: {json.dumps(info_cuenta, indent=2)}")
        
        # Generar número de cuenta si no se proporciona
        if "numero" not in info_cuenta or not info_cuenta["numero"]:
            info_cuenta["numero"] = self._generar_numero_cuenta()
            print(f"Número de cuenta generado: {info_cuenta['numero']}")
        
        # Asegurar que los campos obligatorios estén presentes
        if "tipo" not in info_cuenta:
            info_cuenta["tipo"] = "CUENTA_CORRIENTE"
            
        if "saldo" not in info_cuenta:
            info_cuenta["saldo"] = 0.0
            
        # Manejar campos de usuario - compatibilidad con múltiples formatos
        # Prioridad: usuario_id > userId > id_usuario
        usuario_id = None
        if "usuario_id" in info_cuenta and info_cuenta["usuario_id"]:
            usuario_id = info_cuenta["usuario_id"]
            print(f"Usando usuario_id del request: {usuario_id}")
        elif "userId" in info_cuenta and info_cuenta["userId"]:
            usuario_id = info_cuenta["userId"]
            print(f"Usando userId del request: {usuario_id}")
        elif "id_usuario" in info_cuenta and info_cuenta["id_usuario"]:
            usuario_id = info_cuenta["id_usuario"]
            print(f"Usando id_usuario del request: {usuario_id}")
            
        # Asignar el ID de usuario a todos los campos posibles para garantizar compatibilidad
        if usuario_id:
            info_cuenta["usuario_id"] = usuario_id
            info_cuenta["userId"] = usuario_id
            info_cuenta["id_usuario"] = usuario_id
            print(f"ID de usuario asignado a todos los campos: {usuario_id}")
        
        # Crear la nueva cuenta
        nueva_cuenta = Cuenta(info_cuenta)
        
        # Establecer fechas de creación y actualización
        nueva_cuenta.createdAt = datetime.now().isoformat()
        nueva_cuenta.updatedAt = datetime.now().isoformat()
        
        # Inicializar id_bolsillo como None
        nueva_cuenta.id_bolsillo = None
        
        # Asegurarnos de que el ID de usuario se mantenga
        if usuario_id:
            nueva_cuenta.usuario_id = usuario_id
            print(f"Confirmando que usuario_id está establecido: {nueva_cuenta.usuario_id}")

        # Guardar la cuenta en la base de datos
        print(f"Guardando cuenta en la base de datos: {nueva_cuenta.__dict__}")
        cuenta_guardada = self.repositorioCuenta.save(nueva_cuenta)
        
        # Asegurar que los campos clave estén presentes en la respuesta
        cuenta_guardada["usuario_id"] = cuenta_guardada.get("usuario_id", usuario_id)
        cuenta_guardada["id_usuario"] = cuenta_guardada.get("id_usuario", usuario_id)
        cuenta_guardada["userId"] = cuenta_guardada.get("userId", usuario_id)
        cuenta_guardada["id_bolsillo"] = cuenta_guardada.get("id_bolsillo", None)
        
        # Registrar información de depuración
        print(f"Cuenta creada y guardada en MongoDB: {json.dumps(cuenta_guardada, indent=2)}")

        # Si tenemos un ID de usuario, notificar al servicio de seguridad
        if usuario_id:
            print(f"Notificando al servicio de seguridad sobre la asociación de usuario {usuario_id} con cuenta {cuenta_guardada['_id']}")
            self._notificar_seguridad_asociacion(cuenta_guardada["_id"], usuario_id)

        return cuenta_guardada

    def _generar_numero_cuenta(self):
        """Genera un número de cuenta único de 10 dígitos"""
        digitos = string.digits
        numero = ''.join(random.choice(digitos) for _ in range(10))
        
        # Verificar que no exista ya una cuenta con este número
        while self.repositorioCuenta.query({"numero": numero}):
            numero = ''.join(random.choice(digitos) for _ in range(10))
            
        return numero

    def _notificar_seguridad_asociacion(self, id_cuenta, id_usuario, auth_token=None):
        """Notifica al servicio de seguridad sobre la asociación de un usuario con una cuenta"""
        try:
            # Cargar configuración
            with open("Config/config.json", "r") as archivo_config:
                configuracion = json.load(archivo_config)

            # URL correcta para el endpoint de seguridad
            seguridad_url = configuracion.get('servicios', {}).get('seguridad', 'http://localhost:7777')
            url_completa = f"{seguridad_url}/usuarios/{id_usuario}/cuentas/{id_cuenta}"

            headers = {
                "Content-Type": "application/json"
            }

            if auth_token:
                headers["Authorization"] = auth_token

            print(f"Enviando notificación a seguridad: URL={url_completa}, Headers={headers}")

            response = requests.put(url_completa, json={}, headers=headers, timeout=5)
            print(f"Respuesta de Seguridad: {response.status_code} - {response.text}")

            if response.status_code in [200, 201, 204]:
                print("Notificación a Seguridad exitosa")
                return True
            else:
                print(f"Error en Seguridad: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"Excepción al notificar a Seguridad: {str(e)}")
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
        
        # Actualizar campos si están presentes en info_cuenta
        if "numero" in info_cuenta:
            cuenta_objeto.numero = info_cuenta["numero"]
        
        if "tipo" in info_cuenta:
            cuenta_objeto.tipo = info_cuenta["tipo"]
            
        if "saldo" in info_cuenta:
            cuenta_objeto.saldo = info_cuenta["saldo"]
            
        if "nombre" in info_cuenta:
            cuenta_objeto.nombre = info_cuenta["nombre"]
            
        if "color" in info_cuenta:
            cuenta_objeto.color = info_cuenta["color"]
            
        # Manejar la actualización del ID de usuario
        if "usuario_id" in info_cuenta and info_cuenta["usuario_id"]:
            cuenta_objeto.usuario_id = info_cuenta["usuario_id"]
        elif "userId" in info_cuenta and info_cuenta["userId"]:
            cuenta_objeto.usuario_id = info_cuenta["userId"]
        elif "id_usuario" in info_cuenta and info_cuenta["id_usuario"]:
            cuenta_objeto.usuario_id = info_cuenta["id_usuario"]
            
        # Actualizar la fecha de modificación
        cuenta_objeto.updatedAt = datetime.now().isoformat()
        
        # Guardar los cambios
        cuenta_actualizada = self.repositorioCuenta.save(cuenta_objeto)
        
        return cuenta_actualizada

    def eliminar(self, id):
        return self.repositorioCuenta.delete(id)

    def asignar_usuario_a_cuenta(self, id_cuenta, id_usuario, auth_token=None):
        """
        Asigna un usuario a una cuenta existente.

        Args:
            id_cuenta (str): ID de la cuenta a modificar
            id_usuario (str): ID del usuario a asignar
            auth_token (str, optional): Token de autorización para el servicio de seguridad

        Returns:
            dict: Cuenta actualizada
        """
        print(f"Asignando usuario {id_usuario} a cuenta {id_cuenta}")

        # Verificar que la cuenta existe
        cuenta_actual = self.repositorioCuenta.findById(id_cuenta)
        if not cuenta_actual:
            return {"error": "Cuenta no encontrada"}, 404

        # Crear objeto Cuenta
        cuenta_objeto = Cuenta(cuenta_actual)

        # Asignar el usuario a todos los campos para garantizar compatibilidad
        cuenta_objeto.usuario_id = id_usuario
        cuenta_objeto.id_usuario = id_usuario
        cuenta_objeto.userId = id_usuario

        # Actualizar fecha de modificación
        cuenta_objeto.updatedAt = datetime.now().isoformat()

        # Guardar los cambios
        print(f"Guardando cuenta con usuario asignado: {cuenta_objeto.__dict__}")
        cuenta_guardada = self.repositorioCuenta.save(cuenta_objeto)

        # Intentar notificar al servicio de seguridad varias veces si es necesario
        notificacion_exitosa = False
        for intento in range(3):  # Intentar hasta 3 veces
            notificacion_exitosa = self._notificar_seguridad_asociacion(id_cuenta, id_usuario, auth_token)
            if notificacion_exitosa:
                break
            print(f"Reintentando notificación a seguridad (intento {intento + 1}/3)")

        if not notificacion_exitosa:
            print("ADVERTENCIA: No se pudo notificar al servicio de seguridad, pero la cuenta fue actualizada")
            print("Se recomienda actualizar manualmente el usuario en el servicio de seguridad")

        # Siempre devolvemos la cuenta guardada, incluso si falló la notificación
        return cuenta_guardada

    def obtener_por_usuario(self, id_usuario):
        print(f"🔍 INICIO - Buscando cuentas para el usuario: {id_usuario}")
        print(f"🔎 Tipo de ID: {type(id_usuario)}")
        print(f"🔎 Valor completo del ID: '{id_usuario}'")

        try:
            # Imprimir TODOS los documentos de cuentas
            todas_cuentas = self.repositorioCuenta.findAll()
            print(f"🏦 Total de cuentas en la base de datos: {len(todas_cuentas)}")

            print("Detalles de TODAS las cuentas:")
            for cuenta in todas_cuentas:
                print("---")
                print(f"Cuenta ID: {cuenta.get('_id')}")
                print(f"Campos de usuario:")
                print(f"  usuario_id: {cuenta.get('usuario_id')}")
                print(f"  userId: {cuenta.get('userId')}")
                print(f"  id_usuario: {cuenta.get('id_usuario')}")

            # Búsquedas exhaustivas
            consultas = [
                {"usuario_id": id_usuario},
                {"userId": id_usuario},
                {"id_usuario": id_usuario}
            ]

            cuentas_encontradas = []
            for consulta in consultas:
                print(f"\n🔍 Probando consulta: {consulta}")
                resultado = self.repositorioCuenta.query(consulta)
                print(f"🏦 Cuentas encontradas con esta consulta: {len(resultado)}")

                for cuenta in resultado:
                    print("Cuenta encontrada:")
                    print(cuenta)

                cuentas_encontradas.extend(resultado)

            # Eliminar duplicados
            cuentas_unicas = []
            ids_vistos = set()
            for cuenta in cuentas_encontradas:
                cuenta_id = cuenta.get('_id')
                if cuenta_id not in ids_vistos:
                    ids_vistos.add(cuenta_id)
                    cuentas_unicas.append(cuenta)

            print(f"\n✅ Cuentas únicas encontradas: {len(cuentas_unicas)}")
            for cuenta in cuentas_unicas:
                print(f"Cuenta final: {cuenta}")

            return cuentas_unicas

        except Exception as e:
            print(f"❌ Error completo: {e}")
            import traceback
            traceback.print_exc()
            return []
