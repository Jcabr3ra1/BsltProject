// Script para crear un usuario administrador en MongoDB
db = db.getSiblingDB('bsltproject');

// Buscar el rol ADMIN
var rolAdmin = db.roles.findOne({ nombre: "ADMIN" });
if (!rolAdmin) {
    print("Error: No se encontró el rol ADMIN");
    quit();
}

// Buscar el estado ACTIVO
var estadoActivo = db.estados.findOne({ nombre: "ACTIVO" });
if (!estadoActivo) {
    print("Error: No se encontró el estado ACTIVO");
    quit();
}

// Crear el usuario administrador
var nuevoUsuario = {
    nombre: "Admin",
    apellido: "Prueba",
    email: "admin_test@bsltproject.com",
    password: "$2a$10$X/tytQB0jwA0ySGOB/UYOuw4lVvkO8v6Y/jUid9kcWHEQpex04r3O", // Misma contraseña que los otros usuarios
    roles: [rolAdmin._id],
    estado: estadoActivo._id,
    createdAt: new Date(),
    updatedAt: new Date()
};

// Verificar si el usuario ya existe
var usuarioExistente = db.usuarios.findOne({ email: nuevoUsuario.email });
if (usuarioExistente) {
    print("El usuario ya existe. Actualizando...");
    db.usuarios.updateOne(
        { _id: usuarioExistente._id },
        { 
            $set: {
                roles: nuevoUsuario.roles,
                estado: nuevoUsuario.estado,
                updatedAt: new Date()
            }
        }
    );
    print("Usuario actualizado correctamente.");
} else {
    // Insertar el nuevo usuario
    db.usuarios.insertOne(nuevoUsuario);
    print("Usuario creado correctamente.");
}

// Mostrar todos los usuarios
print("Usuarios en la base de datos:");
db.usuarios.find({}, { email: 1, roles: 1, estado: 1 }).forEach(printjson);
