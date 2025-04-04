# Guía de Uso para la Colección de Postman BsltProject-Finanzas-API-Tests

Esta guía proporciona instrucciones detalladas sobre cómo utilizar la colección de Postman para probar todos los endpoints de la API financiera del BsltProject.

## Índice
1. [Requisitos Previos](#requisitos-previos)
2. [Configuración Inicial](#configuración-inicial)
3. [Autenticación](#autenticación)
4. [Pruebas por Módulo](#pruebas-por-módulo)
   - [Usuarios y Roles](#usuarios-y-roles)
   - [Cuentas](#cuentas)
   - [Bolsillos](#bolsillos)
   - [Tipos de Movimiento](#tipos-de-movimiento)
   - [Tipos de Transacción](#tipos-de-transacción)
   - [Estados](#estados)
   - [Transacciones](#transacciones)
   - [Movimientos](#movimientos)
5. [Flujos de Prueba Completos](#flujos-de-prueba-completos)
6. [Solución de Problemas](#solución-de-problemas)

## Requisitos Previos

Antes de comenzar a utilizar la colección de Postman, asegúrate de tener:

1. **Postman** instalado en tu equipo (versión recomendada: 10.0 o superior)
2. **Servicios Backend** en ejecución:
   - API Gateway (puerto 7777)
   - Servicio de Seguridad
   - Servicio Financiero (puerto 9999)
3. **Base de datos MongoDB** en funcionamiento

## Configuración Inicial

1. **Importar la Colección**:
   - Abre Postman
   - Haz clic en "Import" y selecciona el archivo `BsltProject-Finanzas-API-Tests.postman_collection.json`

2. **Configurar Variables de Entorno**:
   - La colección ya incluye variables predefinidas
   - Verifica que las URLs sean correctas:
     - `apiGatewayUrl`: http://localhost:7777 (o la URL donde se ejecuta tu API Gateway)
     - `finanzasUrl`: http://localhost:9999 (o la URL donde se ejecuta tu servicio financiero)

## Autenticación

Todas las peticiones requieren un token JWT válido. Para obtenerlo:

1. Ejecuta la petición "Login" en la sección "Usuarios y Roles"
2. Proporciona credenciales válidas en el cuerpo de la petición:
   ```json
   {
     "correo": "tu_correo@ejemplo.com",
     "contrasena": "tu_contraseña"
   }
   ```
3. El token se guardará automáticamente en la variable `{{token}}` para ser utilizado en las siguientes peticiones

> **Importante**: El token tiene un tiempo de expiración. Si recibes errores 401 (Unauthorized), vuelve a ejecutar el login para obtener un nuevo token.

## Pruebas por Módulo

### Usuarios y Roles

Secuencia recomendada para pruebas:

1. **Registrar Usuario** - Crear un nuevo usuario en el sistema
   ```json
   {
     "nombre": "Usuario Prueba",
     "correo": "usuario.prueba@example.com",
     "cedula": "1234567890",
     "password": "Contraseña123*"
   }
   ```
2. **Login** - Obtener token de autenticación
   ```json
   {
     "correo": "usuario.prueba@example.com",
     "contrasena": "Contraseña123*"
   }
   ```
3. **Obtener Todos los Usuarios** - Verificar usuarios existentes
4. **Obtener Usuario por ID** - Verificar que el usuario se creó correctamente
5. **Actualizar Usuario** - Modificar datos del usuario
6. **Obtener Todos los Roles** - Verificar roles existentes
7. **Crear Rol** - Crear un nuevo rol
8. **Obtener Rol por ID** - Verificar que el rol se creó correctamente
9. **Asignar Rol a Usuario** - Asignar el rol creado a un usuario
10. **Obtener Todos los Permisos** - Verificar permisos disponibles
11. **Asignar Permiso a Rol** - Asignar un permiso al rol creado

> **Nota**: Guarda los IDs generados en las variables correspondientes (`userId`, `rolId`, `permisoId`) para utilizarlos en peticiones posteriores.

### Cuentas

Secuencia recomendada para pruebas:

1. **Obtener Todas las Cuentas** - Verificar cuentas existentes
2. **Crear Cuenta** - Crear una nueva cuenta
   ```json
   {
     "usuario_id": "{{userId}}",
     "saldo": 1000,
     "nombre": "Cuenta Principal"
   }
   ```
3. **Obtener Cuenta por ID** - Verificar que la cuenta se creó correctamente
4. **Actualizar Cuenta** - Modificar datos de la cuenta
5. **Obtener Cuentas por Usuario** - Verificar las cuentas asociadas al usuario

> **Nota**: Asegúrate de guardar el ID de la cuenta creada en la variable `{{cuentaId}}`.

### Bolsillos

Secuencia recomendada para pruebas:

1. **Obtener Todos los Bolsillos** - Verificar bolsillos existentes
2. **Crear Bolsillo** - Crear un nuevo bolsillo asociado a una cuenta
   ```json
   {
     "cuenta_id": "{{cuentaId}}",
     "saldo": 200,
     "nombre": "Bolsillo Ahorros"
   }
   ```
3. **Obtener Bolsillo por ID** - Verificar que el bolsillo se creó correctamente
4. **Actualizar Bolsillo** - Modificar datos del bolsillo
5. **Obtener Bolsillos por Cuenta** - Verificar los bolsillos asociados a la cuenta

> **Nota**: Guarda el ID del bolsillo creado en la variable `{{bolsilloId}}`.

### Tipos de Movimiento

Secuencia recomendada para pruebas:

1. **Obtener Todos los Tipos de Movimiento** - Verificar tipos existentes
2. **Crear Tipo de Movimiento** - Crear un nuevo tipo de movimiento
   ```json
   {
     "nombre": "Ingreso Salarial",
     "descripcion": "Movimiento de ingreso por concepto de salario"
   }
   ```
3. **Obtener Tipo de Movimiento por ID** - Verificar que se creó correctamente
4. **Actualizar Tipo de Movimiento** - Modificar datos del tipo de movimiento

> **Nota**: Guarda el ID del tipo de movimiento creado en la variable `{{tipoMovimientoId}}`.

### Tipos de Transacción

Secuencia recomendada para pruebas:

1. **Obtener Todos los Tipos de Transacción** - Verificar tipos existentes
2. **Crear Tipo de Transacción** - Crear un nuevo tipo de transacción
   ```json
   {
     "nombre": "Transferencia Interna",
     "descripcion": "Transferencia entre cuentas del mismo usuario"
   }
   ```
3. **Obtener Tipo de Transacción por ID** - Verificar que se creó correctamente
4. **Actualizar Tipo de Transacción** - Modificar datos del tipo de transacción

> **Nota**: Guarda el ID del tipo de transacción creado en la variable `{{tipoTransaccionId}}`.

### Estados

Secuencia recomendada para pruebas:

1. **Obtener Todos los Estados** - Verificar estados existentes
2. **Crear Estado** - Crear un nuevo estado
   ```json
   {
     "nombre": "Pendiente",
     "descripcion": "Transacción en estado pendiente de aprobación"
   }
   ```
3. **Obtener Estado por ID** - Verificar que se creó correctamente
4. **Actualizar Estado** - Modificar datos del estado

> **Nota**: Guarda el ID del estado creado en la variable `{{estadoId}}`.

### Transacciones

Secuencia recomendada para pruebas:

1. **Obtener Todas las Transacciones** - Verificar transacciones existentes
2. **Crear Transacción** - Crear una nueva transacción
   ```json
   {
     "tipo_transaccion_id": "{{tipoTransaccionId}}",
     "estado_id": "{{estadoId}}",
     "monto": 100,
     "descripcion": "Transacción de prueba"
   }
   ```
3. **Obtener Transacción por ID** - Verificar que se creó correctamente
4. **Actualizar Transacción** - Modificar datos de la transacción
5. **Realizar Transferencia** - Probar una transferencia entre cuentas
   ```json
   {
     "cuenta_origen_id": "{{cuentaId}}",
     "cuenta_destino_id": "otra_cuenta_id",
     "monto": 50,
     "descripcion": "Transferencia de prueba"
   }
   ```

> **Nota**: Guarda el ID de la transacción creada en la variable `{{transaccionId}}`.

### Movimientos

Secuencia recomendada para pruebas:

1. **Obtener Todos los Movimientos** - Verificar movimientos existentes
2. **Crear Movimiento** - Crear un nuevo movimiento
   ```json
   {
     "cuenta_id": "{{cuentaId}}",
     "tipo_movimiento_id": "{{tipoMovimientoId}}",
     "monto": 100,
     "descripcion": "Movimiento de prueba"
   }
   ```
3. **Obtener Movimiento por ID** - Verificar que se creó correctamente
4. **Actualizar Movimiento** - Modificar datos del movimiento
5. **Obtener Movimientos por Cuenta** - Verificar los movimientos asociados a la cuenta

> **Nota**: Guarda el ID del movimiento creado en la variable `{{movimientoId}}`.

## Flujos de Prueba Completos

### Flujo 1: Creación de Usuario y Cuenta con Transacción

Este flujo simula el registro de un usuario, creación de cuenta y realización de una transacción:

1. Crear Usuario
2. Asignar Rol a Usuario
3. Crear Cuenta asociada al Usuario
4. Crear Bolsillo asociado a la Cuenta
5. Realizar una Transferencia de la Cuenta al Bolsillo
6. Verificar Movimientos generados

### Flujo 2: Gestión de Transacciones y Estados

Este flujo prueba el ciclo de vida de una transacción:

1. Crear Estado "Pendiente"
2. Crear Estado "Aprobado"
3. Crear Tipo de Transacción
4. Crear Transacción con Estado "Pendiente"
5. Actualizar Transacción a Estado "Aprobado"
6. Verificar el cambio de estado

## Solución de Problemas

### Errores Comunes

1. **Error 401 (Unauthorized)**
   - **Causa**: Token expirado o inválido
   - **Solución**: Ejecuta nuevamente el endpoint de Login para obtener un nuevo token

2. **Error 404 (Not Found)**
   - **Causa**: URL incorrecta o recurso no existente
   - **Solución**: Verifica que estés utilizando el prefijo correcto en las URLs:
     - Para endpoints de finanzas: `/finanzas/...`
     - Para endpoints de seguridad: `/seguridad/...`

3. **Error 500 (Internal Server Error)**
   - **Causa**: Error en el servidor o datos incorrectos
   - **Solución**: Verifica los logs del servidor y asegúrate de que los datos enviados cumplen con el formato esperado

### Consejos Adicionales

- **Variables Dinámicas**: Utiliza los scripts de prueba de Postman para guardar automáticamente IDs y tokens en variables
- **Entornos**: Crea diferentes entornos (desarrollo, pruebas, producción) con sus respectivas variables
- **Colecciones de Prueba**: Utiliza la funcionalidad "Collection Runner" de Postman para ejecutar secuencias de pruebas automáticamente

---

Esta guía ha sido creada para facilitar el uso de la colección de Postman para pruebas de la API financiera del BsltProject. Si encuentras algún problema o tienes sugerencias para mejorar la colección, por favor comunícate con el equipo de desarrollo.
