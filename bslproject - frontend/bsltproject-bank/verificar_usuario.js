// Script para verificar y activar el usuario administrador en MongoDB Cloud
// Conexión a la base de datos en la nube
const uri = "mongodb+srv://root:root@bstproject.98lqw.mongodb.net/BstProject-seguridad_db?retryWrites=true&w=majority&appName=BstProject";

try {
    // Conectar a la base de datos
    print("Conectando a la base de datos en la nube...");
    db = connect(uri);
    print("Conexión exitosa a la base de datos BstProject-seguridad_db");

    // Verificar el rol ADMIN
    print("\nRoles disponibles:");
    db.roles.find().forEach(printjson);

    // Verificar el estado ACTIVO
    print("\nEstados disponibles:");
    db.estados.find().forEach(printjson);

    // Verificar el usuario administrador
    const adminEmail = "admin@bsltproject.com";
    print("\nInformación del usuario administrador:");
    const adminUser = db.usuarios.findOne({ email: adminEmail });
    printjson(adminUser);

    // Verificar si el usuario tiene el estado ACTIVO
    if (adminUser) {
        const estadoId = adminUser.estado;
        const estado = db.estados.findOne({ _id: estadoId });
        print("\nEstado actual del usuario:");
        printjson(estado);

        // Si el estado no es ACTIVO, actualizarlo
        if (estado && estado.nombre !== "ACTIVO") {
            print("\nEl usuario no tiene el estado ACTIVO. Buscando el estado ACTIVO...");
            const estadoActivo = db.estados.findOne({ nombre: "ACTIVO" });
            
            if (estadoActivo) {
                print("Actualizando el estado del usuario a ACTIVO...");
                db.usuarios.updateOne(
                    { _id: adminUser._id },
                    { 
                        $set: {
                            estado: estadoActivo._id,
                            updatedAt: new Date()
                        }
                    }
                );
                print("Usuario actualizado correctamente a estado ACTIVO.");
            } else {
                print("No se encontró el estado ACTIVO en la base de datos.");
            }
        } else {
            print("\nEl usuario ya tiene el estado ACTIVO.");
        }
    } else {
        print("\nNo se encontró el usuario administrador en la base de datos.");
    }

} catch (error) {
    print("Error al conectar o verificar usuario: " + error);
}
