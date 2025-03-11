# Estructura del Proyecto BSLT Bank

Este documento describe la estructura y organización del proyecto BSLT Bank, una aplicación Angular que conecta con servicios backend de seguridad y finanzas.

## Organización del Proyecto

La aplicación sigue una arquitectura modular con clara separación entre las funcionalidades de seguridad y finanzas, siguiendo las mejores prácticas de Angular.

### Estructura de Carpetas

```
src/
├── app/
│   ├── core/                  # Servicios y modelos compartidos
│   │   ├── models/            # Interfaces y tipos
│   │   │   └── index.ts       # Exporta todos los modelos
│   │   └── services/          # Servicios de la aplicación
│   │       ├── finanzas/      # Servicios relacionados con finanzas
│   │       │   └── index.ts   # Exporta todos los servicios de finanzas
│   │       └── seguridad/     # Servicios relacionados con seguridad
│   │           └── index.ts   # Exporta todos los servicios de seguridad
│   ├── features/              # Módulos de funcionalidades
│   │   ├── finanzas/          # Componentes de finanzas
│   │   │   ├── bolsillos/
│   │   │   │   ├── bolsillo-dialog/
│   │   │   │   │   └── index.ts
│   │   │   │   ├── bolsillo-list/
│   │   │   │   │   └── index.ts
│   │   │   │   └── bolsillo-transfer-dialog/
│   │   │   │       └── index.ts
│   │   │   ├── cuentas/
│   │   │   │   └── cuenta-list/
│   │   │   │       └── index.ts
│   │   │   ├── transacciones/
│   │   │   │   ├── transaccion-dialog/
│   │   │   │   │   └── index.ts
│   │   │   │   └── transaccion-list/
│   │   │   │       └── index.ts
│   │   │   ├── tipos-movimiento/
│   │   │   │   ├── tipo-movimiento-dialog/
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   └── tipos-transaccion/
│   │   │       ├── tipo-transaccion-dialog/
│   │   │       │   └── index.ts
│   │   │       └── index.ts
│   │   └── seguridad/         # Componentes de seguridad
│   │       ├── login/
│   │       ├── register/
│   │       └── usuarios/
│   └── shared/                # Componentes y utilidades compartidas
│       └── components/        # Componentes reutilizables
│           ├── confirm-dialog/
│           │   └── index.ts
│           └── index.ts
```

## Convenciones de Importación

Para mantener el código limpio y facilitar las importaciones, se han creado archivos `index.ts` en varias carpetas que exportan todos los elementos de esa carpeta. Esto permite importar múltiples elementos de una carpeta con una sola línea.

### Ejemplos:

```typescript
// Importar servicios de finanzas
import { BolsilloService, TipoMovimientoService, CuentaService, TransaccionService } from '@core/services/finanzas';

// Importar servicios de seguridad
import { AuthService, UsuariosService } from '@core/services/seguridad';

// Importar modelos
import { TipoMovimiento, TipoTransaccion } from '@core/models';

// Importar componentes
import { BolsilloDialogComponent } from '@features/finanzas/bolsillos/bolsillo-dialog';
import { TransaccionListComponent } from '@features/finanzas/transacciones/transaccion-list';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog';
```

## Arquitectura del Sistema

El proyecto BSLT Bank es parte de una arquitectura de microservicios que incluye:

1. **Frontend**: Aplicación Angular (este proyecto)
2. **API Gateway (Puerto 7777)**: Aplicación FastAPI que enruta las solicitudes
3. **Servicio de Seguridad (Puerto 8080)**: Aplicación Spring Boot que maneja la autenticación y seguridad
4. **Servicio Backend Financiero**: Servicio separado para operaciones financieras

El API Gateway actúa como el punto de entrada central y enruta las solicitudes a los microservicios apropiados.

## Convenciones de Codificación

1. **Servicios**: Los servicios se organizan en carpetas según su dominio (finanzas o seguridad).
2. **Componentes**: Los componentes se organizan en módulos de características.
3. **Modelos**: Las interfaces y tipos se definen en la carpeta `core/models`.
4. **Barrel Files**: Se utilizan archivos `index.ts` para facilitar las importaciones.
5. **Rutas Relativas**: Se utilizan rutas relativas para las importaciones dentro del mismo módulo.

## Buenas Prácticas

1. **Separación de Responsabilidades**: Cada componente y servicio tiene una responsabilidad única.
2. **Reutilización de Código**: Se utilizan componentes compartidos para funcionalidades comunes.
3. **Tipado Estricto**: Se utilizan interfaces y tipos para garantizar la seguridad de tipos.
4. **Organización por Dominio**: Los servicios y componentes se organizan según su dominio funcional.
5. **Barrel Files**: Se utilizan archivos `index.ts` para facilitar las importaciones y mantener el código limpio.
