import jwt

CLAVE_SECRETA = "qwertyuiopasdfghjklzxcvbnm123456"  # Tomado de config.json
token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbnNAYWRtaW5zLmNvbSIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc0MTQ3OTE2NywiZXhwIjoxNzQxNDgyNzY3fQ.wje0lMqIYPBpOm3hpFn64rtqXsso86H98RerzmE39gM"

try:
    contenido = jwt.decode(token, CLAVE_SECRETA, algorithms=["HS256"])
    print("Token válido:", contenido)
except jwt.ExpiredSignatureError:
    print("Token expirado")
except jwt.InvalidSignatureError:
    print("Token inválido")
