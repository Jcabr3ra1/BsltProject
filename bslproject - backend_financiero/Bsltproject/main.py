from functools import wraps
import jwt
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from waitress import serve

# Importamos los controladores
from Controladores.ControladorTipoMovimiento import ControladorTipoMovimiento
from Controladores.ControladorTipoTransaccion import ControladorTipoTransaccion
from Controladores.ControladorTransaccion import ControladorTransaccion
from Controladores.ControladorCuenta import ControladorCuenta
from Controladores.ControladorBolsillo import ControladorBolsillo

app = Flask(__name__)
cors = CORS(app)

# Cargar configuración desde config.json
def loadFileConfig():
    with open('Config/config.json') as f:
        return json.load(f)

dataConfig = loadFileConfig()
SECRET_KEY = dataConfig["jwt-secret"]  # ✅ Usamos el mismo SECRET_KEY del Backend de Seguridad

# Middleware para verificar JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Token no proporcionado"}), 403

        token = auth_header.split(" ")[1]  # Extrae solo el token sin "Bearer"
        try:
            decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user = decoded_token  # Guarda los datos del usuario en la solicitud
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 403
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token inválido"}), 403

        return f(*args, **kwargs)
    return decorated


# Inicializar el controlador de Estado
controlador_cuenta = ControladorCuenta()
controlador_bolsillo = ControladorBolsillo()
controlador_tipo_movimiento = ControladorTipoMovimiento()
controlador_tipo_transaccion = ControladorTipoTransaccion()
controlador_transaccion = ControladorTransaccion()

@app.route("/", methods=['GET'])
def test():
    return jsonify({"message": "Server running ..."})

####################################### CUENTAS #######################################
@app.route("/cuenta", methods=['GET'])
def obtenerCuentas():
    return jsonify(controlador_cuenta.index())

@app.route("/cuenta", methods=['POST'])
def crearCuenta():
    data = request.get_json()
    return jsonify(controlador_cuenta.create(data))

@app.route("/cuenta/<string:id>", methods=['GET'])
def obtenerCuenta(id):
    return jsonify(controlador_cuenta.show(id))

@app.route("/cuenta/<string:id>", methods=['PUT'])
def actualizarCuenta(id):
    data = request.get_json()
    return jsonify(controlador_cuenta.update(id, data))

@app.route("/cuenta/<string:id>", methods=['DELETE'])
def eliminarCuenta(id):
    return jsonify(controlador_cuenta.delete(id))

@app.route("/cuenta/<string:id_cuenta>/usuario/<string:id_usuario>", methods=['PUT'])
def asignarUsuarioACuenta(id_cuenta, id_usuario):
    return jsonify(controlador_cuenta.asignarUsuario(id_cuenta, id_usuario))

########################################### BOLSILLO ##############################################
@app.route("/bolsillo", methods=['GET'])
def obtenerBolsillos():
    return jsonify(controlador_bolsillo.index())

@app.route("/bolsillo", methods=['POST'])
def crearBolsillo():
    data = request.get_json()
    return jsonify(controlador_bolsillo.create(data))

@app.route("/bolsillo/<string:id>", methods=['GET'])
def obtenerBolsillo(id):
    return jsonify(controlador_bolsillo.show(id))

@app.route("/bolsillo/<string:id>", methods=['PUT'])
def actualizarBolsillo(id):
    data = request.get_json()
    return jsonify(controlador_bolsillo.update(id, data))

@app.route("/bolsillo/<string:id>", methods=['DELETE'])
def eliminarBolsillo(id):
    return jsonify(controlador_bolsillo.delete(id))

@app.route("/bolsillo/<string:id_bolsillo>/cuenta/<string:id_cuenta>", methods=['PUT'])
def asignarCuentaABolsillo(id_bolsillo, id_cuenta):
    return jsonify(controlador_bolsillo.asignarCuenta(id_bolsillo, id_cuenta))

########################################### TipoMovimiento ##############################################
@app.route("/tipo_movimiento", methods=['GET'])
def obtenerTipoMovimientos():
    return jsonify(controlador_tipo_movimiento.obtenerTodos())

@app.route("/tipo_movimiento", methods=['POST'])
def crearTipoMovimiento():
    data = request.get_json()
    return jsonify(controlador_tipo_movimiento.crear(data))

@app.route("/tipo_movimiento/<string:id>", methods=['GET'])
def obtenerTipoMovimiento(id):
    return jsonify(controlador_tipo_movimiento.obtenerPorId(id))

@app.route("/tipo_movimiento/<string:id>", methods=['PUT'])
def actualizarTipoMovimiento(id):
    data = request.get_json()
    return jsonify(controlador_tipo_movimiento.actualizar(id, data))

@app.route("/tipo_movimiento/<string:id>", methods=['DELETE'])
def eliminarTipoMovimiento(id):
    return jsonify(controlador_tipo_movimiento.eliminar(id))

########################################### TipoTransaccion ##############################################
@app.route("/tipo_transaccion", methods=['GET'])
def obtenerTiposTransaccion():
    return jsonify(controlador_tipo_transaccion.obtenerTodos())

@app.route("/tipo_transaccion", methods=['POST'])
def crearTipoTransaccion():
    data = request.get_json()
    return jsonify(controlador_tipo_transaccion.crear(data))

@app.route("/tipo_transaccion/<string:id>", methods=['GET'])
def obtenerTipoTransaccion(id):
    return jsonify(controlador_tipo_transaccion.obtenerPorId(id))

@app.route("/tipo_transaccion/<string:id>", methods=['PUT'])
def actualizarTipoTransaccion(id):
    data = request.get_json()
    return jsonify(controlador_tipo_transaccion.actualizar(id, data))

@app.route("/tipo_transaccion/<string:id>", methods=['DELETE'])
def eliminarTipoTransaccion(id):
    return jsonify(controlador_tipo_transaccion.eliminar(id))

########################################### TRANSACCIONES ###########################################################
@app.route("/transaccion", methods=['GET'])
def obtenerTransacciones():
    return jsonify(controlador_transaccion.obtenerTodas())

@app.route("/transaccion", methods=['POST'])
def crearTransaccion():
    data = request.get_json()
    return jsonify(controlador_transaccion.crear(data))

@app.route("/transaccion/<string:id>", methods=['GET'])
def obtenerTransaccion(id):
    return jsonify(controlador_transaccion.obtenerPorId(id))

@app.route("/transaccion/<string:id>", methods=['PUT'])
def actualizarTransaccion(id):
    data = request.get_json()
    return jsonify(controlador_transaccion.actualizar(id, data))

@app.route("/transaccion/<string:id>", methods=['DELETE'])
def eliminarTransaccion(id):
    return jsonify(controlador_transaccion.eliminar(id))

if __name__ == '__main__':
    dataConfig = loadFileConfig()
    print(f"Server running: http://{dataConfig['url-backend']}:{dataConfig['port']}")
    serve(app, host=dataConfig["url-backend"], port=dataConfig["port"])
