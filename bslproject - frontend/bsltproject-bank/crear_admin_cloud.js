// Script para crear un usuario administrador en MongoDB Cloud
// Conexión a la base de datos en la nube
const uri = "mongodb+srv://root:root@bstproject.98lqw.mongodb.net/BstProject-seguridad_db?retryWrites=true&w=majority&appName=BstProject";

try {
    // Conectar a la base de datos
    print("Conectando a la base de datos en la nube...");
    db = connect(uri);
    print("Conexión exitosa a la base de datos BstProject-seguridad_db");

    // Crear rol ADMIN si no existe
    let rolAdmin = db.roles.findOne({ nombre: "ADMIN" });
    if (!rolAdmin) {
        print("Creando rol ADMIN...");
        rolAdmin = {
            nombre: "ADMIN",
            descripcion: "Rol de administrador con todos los permisos",
            permisos: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        db.roles.insertOne(rolAdmin);
        rolAdmin = db.roles.findOne({ nombre: "ADMIN" });
        print("Rol ADMIN creado con ID: " + rolAdmin._id);
    } else {
        print("Rol ADMIN encontrado con ID: " + rolAdmin._id);
    }

    // Crear estado ACTIVO si no existe
    let estadoActivo = db.estados.findOne({ nombre: "ACTIVO" });
    if (!estadoActivo) {
        print("Creando estado ACTIVO...");
        estadoActivo = {
            nombre: "ACTIVO",
            descripcion: "Estado activo para usuarios",
            createdAt: new Date(),
            updatedAt: new Date()
        };
        db.estados.insertOne(estadoActivo);
        estadoActivo = db.estados.findOne({ nombre: "ACTIVO" });
        print("Estado ACTIVO creado con ID: " + estadoActivo._id);
    } else {
        print("Estado ACTIVO encontrado con ID: " + estadoActivo._id);
    }

    // Crear usuario administrador
    const adminEmail = "admin@bsltproject.com";
    let adminUser = db.usuarios.findOne({ email: adminEmail });
    
    // Contraseña: admin123 (hash BCrypt)
    const passwordHash = "$2a$10$X/tytQB0jwA0ySGOB/UYOuw4lVvkO8v6Y/jUid9kcWHEQpex04r3O";
    
    if (!adminUser) {
        print("Creando usuario administrador...");
        adminUser = {
            nombre: "Administrador",
            apellido: "Sistema",
            email: adminEmail,
            password: passwordHash,
            roles: [rolAdmin._id],
            estado: estadoActivo._id,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        db.usuarios.insertOne(adminUser);
        print("Usuario administrador creado con email: " + adminEmail);
    } else {
        print("Actualizando usuario administrador existente...");
        db.usuarios.updateOne(
            { _id: adminUser._id },
            { 
                $set: {
                    roles: [rolAdmin._id],
                    estado: estadoActivo._id,
                    password: passwordHash,
                    updatedAt: new Date()
                }
            }
        );
        print("Usuario administrador actualizado con email: " + adminEmail);
    }

    // Mostrar información del usuario creado
    adminUser = db.usuarios.findOne({ email: adminEmail });
    print("\nInformación del usuario administrador:");
    printjson(adminUser);

    print("\nUsuario administrador creado/actualizado correctamente.");
    print("Email: " + adminEmail);
    print("Contraseña: admin123");

} catch (error) {
    print("Error al conectar o crear usuario: " + error);
}
