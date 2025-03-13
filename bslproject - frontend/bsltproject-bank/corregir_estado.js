// Script para corregir el estado del usuario administrador en MongoDB Cloud
// Conexión a la base de datos en la nube
const uri = "mongodb+srv://root:root@bstproject.98lqw.mongodb.net/BstProject-seguridad_db?retryWrites=true&w=majority&appName=BstProject";

try {
    // Conectar a la base de datos
    print("Conectando a la base de datos en la nube...");
    db = connect(uri);
    print("Conexión exitosa a la base de datos BstProject-seguridad_db");

    // Obtener el estado ACTIVO correcto (todo en mayúsculas)
    const estadoActivoMayusculas = db.estados.findOne({ nombre: "ACTIVO" });
    print("\nEstado ACTIVO (todo en mayúsculas):");
    printjson(estadoActivoMayusculas);

    if (!estadoActivoMayusculas) {
        print("Error: No se encontró el estado ACTIVO en la base de datos.");
        quit();
    }

    // Actualizar el usuario administrador con el estado ACTIVO correcto
    const adminEmail = "admin@bsltproject.com";
    print("\nActualizando usuario administrador con el estado ACTIVO correcto...");
    
    const resultado = db.usuarios.updateOne(
        { email: adminEmail },
        { 
            $set: {
                estado: estadoActivoMayusculas._id,
                updatedAt: new Date()
            }
        }
    );
    
    print("Resultado de la actualización:");
    printjson(resultado);

    // Verificar el usuario actualizado
    const adminUser = db.usuarios.findOne({ email: adminEmail });
    print("\nInformación del usuario administrador actualizado:");
    printjson(adminUser);

    // Verificar si el estado del usuario es el correcto
    if (adminUser && adminUser.estado.equals(estadoActivoMayusculas._id)) {
        print("\nEl usuario administrador ahora tiene el estado ACTIVO correcto.");
    } else {
        print("\nError: No se pudo actualizar el estado del usuario administrador.");
    }

} catch (error) {
    print("Error al conectar o actualizar usuario: " + error);
}
