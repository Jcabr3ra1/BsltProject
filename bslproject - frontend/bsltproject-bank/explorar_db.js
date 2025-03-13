// Script para explorar la estructura de la base de datos MongoDB
db = db.getSiblingDB('bsltproject');

// Listar todas las colecciones
print("Colecciones en la base de datos:");
db.getCollectionNames().forEach(printjson);

// Explorar la colección de roles
print("\nRoles disponibles:");
db.roles.find().forEach(printjson);

// Explorar la colección de estados
print("\nEstados disponibles:");
db.estados.find().forEach(printjson);

// Explorar la colección de usuarios
print("\nUsuarios existentes:");
db.usuarios.find({}, {email: 1, password: 1, roles: 1, estado: 1}).forEach(printjson);
