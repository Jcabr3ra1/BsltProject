# BsltProject - Pruebas de API Financiera

Este repositorio contiene recursos para probar la API financiera del BsltProject, incluyendo una colección completa de Postman y documentación detallada.

## Contenido

- **BsltProject-Finanzas-API-Tests.postman_collection.json**: Colección de Postman con todos los endpoints para probar el sistema financiero.
- **GUIA-POSTMAN-API-TESTS.md**: Guía detallada sobre cómo utilizar la colección de Postman para realizar pruebas.

## Arquitectura del Sistema

El sistema BsltProject está compuesto por varios microservicios:

1. **API Gateway (Puerto 7778)**: Punto de entrada único que enruta las solicitudes a los servicios correspondientes.
2. **Servicio de Seguridad**: Gestiona la autenticación, usuarios, roles y permisos.
3. **Servicio Financiero (Puerto 9999)**: Gestiona cuentas, bolsillos, transacciones y movimientos financieros.

## Puntos Importantes a Considerar

### Prefijos de URL

- Todas las rutas del servicio financiero deben incluir el prefijo `/finanzas` al comunicarse con el API Gateway.
- Todas las rutas del servicio de seguridad deben incluir el prefijo `/seguridad` al comunicarse con el API Gateway.

### Asociación de Cuentas con Usuarios

Al crear cuentas, es fundamental proporcionar correctamente el ID de usuario para garantizar que las cuentas se asocien adecuadamente. La API admite varios formatos para el ID de usuario:

- `usuario_id`
- `userId`
- `id_usuario`

### Autenticación

Todas las peticiones (excepto el login) requieren un token JWT válido que debe incluirse en el encabezado de autorización:

```
Authorization: Bearer {token}
```

## Cómo Empezar

1. Asegúrate de que todos los servicios backend estén en funcionamiento:
   - API Gateway
   - Servicio de Seguridad
   - Servicio Financiero
   - Base de datos MongoDB

2. Importa la colección de Postman:
   - Abre Postman
   - Haz clic en "Import" y selecciona el archivo `BsltProject-Finanzas-API-Tests.postman_collection.json`

3. Consulta la guía detallada en `GUIA-POSTMAN-API-TESTS.md` para instrucciones paso a paso sobre cómo realizar las pruebas.

## Flujos de Prueba Recomendados

Para probar completamente el sistema, se recomienda seguir estos flujos:

1. **Flujo de Usuario y Cuenta**:
   - Crear un usuario
   - Asignar un rol al usuario
   - Crear una cuenta asociada al usuario
   - Verificar que la cuenta aparece en las cuentas del usuario

2. **Flujo de Transacciones**:
   - Crear dos cuentas
   - Realizar una transferencia entre ellas
   - Verificar los movimientos generados
   - Comprobar que los saldos se actualizan correctamente

3. **Flujo de Bolsillos**:
   - Crear una cuenta
   - Crear un bolsillo asociado a la cuenta
   - Transferir fondos de la cuenta al bolsillo
   - Verificar los saldos actualizados

## Solución de Problemas Comunes

### Error 404 en Peticiones al API Gateway

Si recibes errores 404 al hacer peticiones al API Gateway, verifica que estés utilizando los prefijos correctos:
- Para el servicio financiero: `/finanzas/...`
- Para el servicio de seguridad: `/seguridad/...`

### Cuentas No Visibles para un Usuario

Si las cuentas creadas no aparecen asociadas a un usuario, asegúrate de:
1. Proporcionar correctamente el ID de usuario al crear la cuenta
2. Verificar que el servicio de seguridad está funcionando correctamente
3. Comprobar que la notificación entre servicios funciona adecuadamente

## Contribuciones

Si encuentras problemas o tienes sugerencias para mejorar las pruebas, por favor:
1. Documenta el problema con pasos detallados para reproducirlo
2. Proporciona información sobre el entorno (versiones, configuración)
3. Sugiere posibles soluciones si las tienes
