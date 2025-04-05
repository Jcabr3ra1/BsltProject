# Guía Completa para Pruebas de API con Postman - BSLTProject

## Estructura del Sistema

El sistema está compuesto por tres componentes principales:

1. **API Gateway (Puerto 7777)**: Punto de entrada central que enruta las solicitudes
2. **Servicio de Seguridad (Puerto 8080)**: Servicio Spring Boot para autenticación y gestión de usuarios
3. **Servicio Financiero (Puerto 9999)**: Servicio para operaciones financieras

## Colecciones de Postman Creadas

Se han creado cuatro colecciones de Postman que cubren todos los endpoints disponibles en el sistema:

1. **BSLTProject-Postman-Seguridad.json**: Endpoints relacionados con autenticación, usuarios, roles, permisos y estados
2. **BSLTProject-Postman-Finanzas-Cuentas.json**: Endpoints para gestionar cuentas
3. **BSLTProject-Postman-Finanzas-Bolsillos.json**: Endpoints para gestionar bolsillos
4. **BSLTProject-Postman-Finanzas-Transacciones.json**: Endpoints para gestionar transacciones y operaciones específicas
5. **BSLTProject-Postman-Finanzas-Catalogos.json**: Endpoints para gestionar catálogos (tipos de movimiento, tipos de transacción, estados de transacción)

## Cómo Importar las Colecciones en Postman

1. Abre Postman
2. Haz clic en "Import" (Importar)
3. Selecciona los archivos:
   - `BSLTProject-Postman-Seguridad.json`
   - `BSLTProject-Postman-Finanzas-Cuentas.json`
   - `BSLTProject-Postman-Finanzas-Bolsillos.json`
   - `BSLTProject-Postman-Finanzas-Transacciones.json`
   - `BSLTProject-Postman-Finanzas-Catalogos.json`
4. Confirma la importación

## Configuración de Variables

Para facilitar las pruebas, debes configurar estas variables en Postman:

1. `token`: El token JWT obtenido al iniciar sesión
2. `userId`: ID del usuario con el que estás trabajando
3. `cuentaId`: ID de la cuenta que quieres manipular
4. `bolsilloId`: ID del bolsillo que quieres manipular
5. `cuentaOrigenId`: ID de la cuenta origen para transacciones
6. `cuentaDestinoId`: ID de la cuenta destino para transacciones
7. `bolsilloOrigenId`: ID del bolsillo origen para transacciones
8. `bolsilloDestinoId`: ID del bolsillo destino para transacciones
9. `tipoMovimientoId`: ID del tipo de movimiento para transacciones
10. `tipoTransaccionId`: ID del tipo de transacción para transacciones
11. `estadoTransaccionId`: ID del estado de transacción
12. `roleId`: ID del rol para operaciones de seguridad
13. `permissionId`: ID del permiso para operaciones de seguridad
14. `estadoId`: ID del estado para operaciones de seguridad

## Flujo de Pruebas Recomendado

### 1. Autenticación

1. **Registro de Usuario**:
   - POST `http://localhost:7777/seguridad/autenticacion/registro`
   - Body: 
     ```json
     {
         "email": "usuario@ejemplo.com",
         "password": "contraseña123",
         "nombre": "Usuario",
         "apellido": "Ejemplo"
     }
     ```

2. **Login**:
   - POST `http://localhost:7777/seguridad/autenticacion/login`
   - Body:
     ```json
     {
         "email": "usuario@ejemplo.com",
         "password": "contraseña123"
     }
     ```
   - **Importante**: Guarda el token JWT de la respuesta en la variable `token` y el ID de usuario en la variable `userId`

3. **Verificar Token**:
   - POST `http://localhost:7777/seguridad/autenticacion/verificar-token`
   - Body:
     ```json
     {
         "token": "{{token}}"
     }
     ```

### 2. Gestión de Usuarios y Roles

1. **Obtener Todos los Usuarios**:
   - GET `http://localhost:7777/seguridad/usuarios`
   - Header: `Authorization: Bearer {{token}}`

2. **Obtener Todos los Roles**:
   - GET `http://localhost:7777/seguridad/roles`
   - Header: `Authorization: Bearer {{token}}`
   - Guarda el ID de un rol en la variable `roleId`

3. **Asignar Rol a Usuario**:
   - PUT `http://localhost:7777/seguridad/usuarios/{{userId}}/roles/{{roleId}}`
   - Header: `Authorization: Bearer {{token}}`

### 3. Gestión de Catálogos

1. **Obtener Tipos de Movimiento**:
   - GET `http://localhost:7777/finanzas/tipos-movimiento`
   - Header: `Authorization: Bearer {{token}}`
   - Guarda un ID en la variable `tipoMovimientoId`

2. **Obtener Tipos de Transacción**:
   - GET `http://localhost:7777/finanzas/tipos-transaccion`
   - Header: `Authorization: Bearer {{token}}`
   - Guarda un ID en la variable `tipoTransaccionId`

3. **Inicializar Estados de Transacción**:
   - POST `http://localhost:7777/finanzas/estados-transaccion/inicializar`
   - Header: `Authorization: Bearer {{token}}`

4. **Obtener Estados de Transacción**:
   - GET `http://localhost:7777/finanzas/estados-transaccion`
   - Header: `Authorization: Bearer {{token}}`
   - Guarda un ID en la variable `estadoTransaccionId`

### 4. Gestión de Cuentas y Bolsillos

1. **Crear Cuenta**:
   - POST `http://localhost:7777/finanzas/cuentas`
   - Header: `Authorization: Bearer {{token}}`
   - Body:
     ```json
     {
         "nombre": "Cuenta Principal",
         "saldo": 1000,
         "tipo": "AHORRO",
         "usuario_id": "{{userId}}"
     }
     ```
   - Guarda el ID de la cuenta creada en la variable `cuentaId` y también en `cuentaOrigenId`

2. **Crear Otra Cuenta**:
   - POST `http://localhost:7777/finanzas/cuentas`
   - Header: `Authorization: Bearer {{token}}`
   - Body:
     ```json
     {
         "nombre": "Cuenta Secundaria",
         "saldo": 500,
         "tipo": "CORRIENTE",
         "usuario_id": "{{userId}}"
     }
     ```
   - Guarda el ID de esta cuenta en la variable `cuentaDestinoId`

3. **Crear Bolsillo**:
   - POST `http://localhost:7777/finanzas/bolsillos`
   - Header: `Authorization: Bearer {{token}}`
   - Body:
     ```json
     {
         "nombre": "Bolsillo Ahorros",
         "saldo": 0,
         "cuenta_id": "{{cuentaId}}"
     }
     ```
   - Guarda el ID del bolsillo en las variables `bolsilloId` y `bolsilloDestinoId`

4. **Crear Otro Bolsillo**:
   - POST `http://localhost:7777/finanzas/bolsillos`
   - Header: `Authorization: Bearer {{token}}`
   - Body:
     ```json
     {
         "nombre": "Bolsillo Gastos",
         "saldo": 200,
         "cuenta_id": "{{cuentaDestinoId}}"
     }
     ```
   - Guarda el ID de este bolsillo en la variable `bolsilloOrigenId`

### 5. Operaciones Financieras

1. **Transferencia de Cuenta a Cuenta**:
   - POST `http://localhost:7777/finanzas/transacciones/cuenta-cuenta`
   - Header: `Authorization: Bearer {{token}}`
   - Body:
     ```json
     {
         "cuentaOrigenId": "{{cuentaOrigenId}}",
         "cuentaDestinoId": "{{cuentaDestinoId}}",
         "tipoMovimientoId": "{{tipoMovimientoId}}",
         "monto": 100,
         "descripcion": "Transferencia entre cuentas"
     }
     ```

2. **Transferencia de Cuenta a Bolsillo**:
   - POST `http://localhost:7777/finanzas/transacciones/cuenta-bolsillo`
   - Header: `Authorization: Bearer {{token}}`
   - Body:
     ```json
     {
         "cuentaOrigenId": "{{cuentaOrigenId}}",
         "bolsilloDestinoId": "{{bolsilloDestinoId}}",
         "tipoMovimientoId": "{{tipoMovimientoId}}",
         "monto": 50,
         "descripcion": "Transferencia de cuenta a bolsillo"
     }
     ```

3. **Consignación de Banco a Cuenta**:
   - POST `http://localhost:7777/finanzas/transacciones/banco-cuenta`
   - Header: `Authorization: Bearer {{token}}`
   - Body:
     ```json
     {
         "cuentaDestinoId": "{{cuentaDestinoId}}",
         "tipoMovimientoId": "{{tipoMovimientoId}}",
         "monto": 200,
         "descripcion": "Consignación de banco a cuenta"
     }
     ```

4. **Obtener Transacciones del Usuario**:
   - GET `http://localhost:7777/finanzas/transacciones/usuario/{{userId}}`
   - Header: `Authorization: Bearer {{token}}`

## Consideraciones Importantes

### Prefijos en las URLs

Según los análisis realizados en el código:

1. **Para el servicio de seguridad**: Todas las rutas deben incluir el prefijo `/seguridad` cuando se envían desde el API Gateway al servicio de seguridad.
   - Ejemplo: `http://localhost:7777/seguridad/autenticacion/login`

2. **Para el servicio financiero**: Todas las rutas deben incluir el prefijo `/finanzas` cuando se envían desde el API Gateway al servicio financiero.
   - Ejemplo: `http://localhost:7777/finanzas/cuentas`

### Problemas Comunes y Soluciones

1. **Error 404**: Verifica que estés usando los prefijos correctos (`/seguridad` o `/finanzas`) en las URLs.

2. **Error 403**: Asegúrate de incluir el token JWT en el header `Authorization` con el formato `Bearer {{token}}`.

3. **Error 500**: Revisa los logs del servidor para identificar el problema específico. Podría ser un problema con la estructura del JSON o un error interno del servidor.

4. **Problemas con IDs de usuario**: Asegúrate de usar el formato correcto para los IDs de usuario. El sistema acepta varios formatos (`usuario_id`, `userId`, `id_usuario`).

## Tokens JWT para Pruebas Rápidas

Si quieres hacer pruebas rápidas, puedes usar estos tokens predefinidos:

1. **Usuario con rol ADMIN**:
   ```
   eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdXBlcmFkbWluQGJzbHRwcm9qZWN0LmNvbSIsInJvbGVzIjpbIkFETUlOIl0sImlhdCI6MTc0MTgyNDY2NSwiZXhwIjoxNzQxOTExMDY1fQ.FQtzDZrO8bkGxVyLWubW8iioWr77Vq5ztxjZ9ibrWn0
   ```

2. **Usuario con rol USER**:
   ```
   eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbl9udWV2b0Bic2x0cHJvamVjdC5jb20iLCJyb2xlcyI6WyJVU0VSIl0sImlhdCI6MTc0MTgyNDQ4NywiZXhwIjoxNzQxOTEwODg3fQ.fFbniUoJBhNQf8ebEkB3OKAbPjrBc-c22hjFX3ltdtY
   ```

## Iniciar los Servicios

Para que puedas probar los endpoints, asegúrate de que todos los servicios estén corriendo:

1. **API Gateway** (Puerto 7777):
   - Navega a `C:\Users\juan_\Desktop\Proyecto\finanzas-seguridad-api\bslproject - ApiGateway`
   - Ejecuta el script de inicio (run.bat o run.sh)

2. **Servicio de Seguridad** (Puerto 8080):
   - Navega a `C:\Users\juan_\Desktop\Proyecto\finanzas-seguridad-api\bslproject - seguridad`
   - Ejecuta el script de inicio (run.bat o run.sh)

3. **Servicio Financiero** (Puerto 9999):
   - Navega a `C:\Users\juan_\Desktop\Proyecto\finanzas-seguridad-api\bslproject - backend_financiero`
   - Ejecuta el script de inicio (run.bat o run.sh)

## Lista Completa de Endpoints

### Seguridad

#### Autenticación
- POST `/seguridad/autenticacion/registro` - Registrar un nuevo usuario
- POST `/seguridad/autenticacion/login` - Iniciar sesión
- POST `/seguridad/autenticacion/verificar-token` - Verificar token JWT
- POST `/seguridad/cerrar-sesion` - Cerrar sesión

#### Usuarios
- GET `/seguridad/usuarios` - Obtener todos los usuarios
- GET `/seguridad/usuarios/{id}` - Obtener usuario por ID
- PUT `/seguridad/usuarios/{id}` - Actualizar usuario
- DELETE `/seguridad/usuarios/{id}` - Eliminar usuario
- PUT `/seguridad/usuarios/{userId}/roles/{roleId}` - Asignar rol a usuario
- PUT `/seguridad/usuarios/{userId}/estados/{estadoId}` - Asignar estado a usuario
- PUT `/seguridad/usuarios/{userId}/cuentas/{accountId}` - Asignar cuenta a usuario

#### Roles
- GET `/seguridad/roles` - Obtener todos los roles
- GET `/seguridad/roles/{id}` - Obtener rol por ID
- GET `/seguridad/roles/name/{name}` - Obtener rol por nombre
- POST `/seguridad/roles` - Crear rol
- PUT `/seguridad/roles/{id}` - Actualizar rol
- DELETE `/seguridad/roles/{id}` - Eliminar rol
- GET `/seguridad/roles/{id}/permisos` - Obtener permisos de rol
- GET `/seguridad/roles/{id}/users` - Obtener usuarios con rol

#### Permisos
- GET `/seguridad/permisos` - Obtener todos los permisos
- GET `/seguridad/permisos/{id}` - Obtener permiso por ID
- GET `/seguridad/permisos/nombre/{nombre}` - Obtener permiso por nombre
- POST `/seguridad/permisos` - Crear permiso
- PUT `/seguridad/permisos/{id}` - Actualizar permiso
- DELETE `/seguridad/permisos/{id}` - Eliminar permiso
- PUT `/seguridad/permisos/{permissionId}/roles/{roleId}` - Asignar permiso a rol
- DELETE `/seguridad/permisos/{permissionId}/roles/{roleId}` - Eliminar permiso de rol

#### Estados
- GET `/seguridad/estados` - Obtener todos los estados
- GET `/seguridad/estados/{id}` - Obtener estado por ID
- POST `/seguridad/estados` - Crear estado
- PUT `/seguridad/estados/{id}` - Actualizar estado
- DELETE `/seguridad/estados/{id}` - Eliminar estado

### Finanzas

#### Cuentas
- GET `/finanzas/cuentas` - Obtener todas las cuentas
- POST `/finanzas/cuentas` - Crear cuenta
- GET `/finanzas/cuentas/{id}` - Obtener cuenta por ID
- PUT `/finanzas/cuentas/{id}` - Actualizar cuenta
- DELETE `/finanzas/cuentas/{id}` - Eliminar cuenta
- GET `/finanzas/cuentas/usuario/{id_usuario}` - Obtener cuentas por usuario
- PUT `/finanzas/cuentas/{id}/usuario/{id_usuario}` - Asignar usuario a cuenta

#### Bolsillos
- GET `/finanzas/bolsillos` - Obtener todos los bolsillos
- POST `/finanzas/bolsillos` - Crear bolsillo
- GET `/finanzas/bolsillos/{id}` - Obtener bolsillo por ID
- PUT `/finanzas/bolsillos/{id}` - Actualizar bolsillo
- DELETE `/finanzas/bolsillos/{id}` - Eliminar bolsillo
- PUT `/finanzas/bolsillos/{id_bolsillo}/cuentas/{id_cuenta}` - Asignar cuenta a bolsillo

#### Transacciones
- GET `/finanzas/transacciones` - Obtener todas las transacciones
- POST `/finanzas/transacciones` - Crear transacción
- GET `/finanzas/transacciones/{id}` - Obtener transacción por ID
- PUT `/finanzas/transacciones/{id}/anular` - Anular transacción
- GET `/finanzas/transacciones/usuario/{id_usuario}` - Obtener transacciones por usuario
- GET `/finanzas/transacciones/usuario/{id_usuario}/proximos-pagos` - Obtener próximos pagos
- GET `/finanzas/transacciones/historial` - Obtener historial de transacciones

#### Transacciones Específicas
- POST `/finanzas/transacciones/cuenta-cuenta` - Transferencia cuenta a cuenta
- POST `/finanzas/transacciones/cuenta-bolsillo` - Transferencia cuenta a bolsillo
- POST `/finanzas/transacciones/bolsillo-cuenta` - Transferencia bolsillo a cuenta
- POST `/finanzas/transacciones/banco-cuenta` - Consignación banco a cuenta
- POST `/finanzas/transacciones/banco-bolsillo` - Consignación banco a bolsillo
- POST `/finanzas/transacciones/cuenta-banco` - Retiro cuenta a banco

#### Tipos de Movimiento
- GET `/finanzas/tipos-movimiento` - Obtener todos los tipos de movimiento
- POST `/finanzas/tipos-movimiento` - Crear tipo de movimiento
- GET `/finanzas/tipos-movimiento/{id}` - Obtener tipo de movimiento por ID
- PUT `/finanzas/tipos-movimiento/{id}` - Actualizar tipo de movimiento
- DELETE `/finanzas/tipos-movimiento/{id}` - Eliminar tipo de movimiento

#### Tipos de Transacción
- GET `/finanzas/tipos-transaccion` - Obtener todos los tipos de transacción
- POST `/finanzas/tipos-transaccion` - Crear tipo de transacción
- GET `/finanzas/tipos-transaccion/{id}` - Obtener tipo de transacción por ID
- PUT `/finanzas/tipos-transaccion/{id}` - Actualizar tipo de transacción
- DELETE `/finanzas/tipos-transaccion/{id}` - Eliminar tipo de transacción

#### Estados de Transacción
- GET `/finanzas/estados-transaccion` - Obtener todos los estados de transacción
- POST `/finanzas/estados-transaccion` - Crear estado de transacción
- GET `/finanzas/estados-transaccion/{id}` - Obtener estado de transacción por ID
- PUT `/finanzas/estados-transaccion/{id}` - Actualizar estado de transacción
- DELETE `/finanzas/estados-transaccion/{id}` - Eliminar estado de transacción
- POST `/finanzas/estados-transaccion/inicializar` - Inicializar estados predeterminados
