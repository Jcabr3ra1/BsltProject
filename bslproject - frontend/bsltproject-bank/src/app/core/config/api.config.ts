/**
 * Configuración de las APIs del sistema
 * 
 * Este archivo contiene las URLs base para conectarse a los diferentes
 * servicios a través del API Gateway.
 */

export const API_CONFIG = {
  // API Gateway central que enruta las solicitudes a los microservicios
  API_GATEWAY_URL: 'http://localhost:7777',
  
  // Endpoints para el servicio de seguridad
  SECURITY_API: {
    BASE_URL: 'http://localhost:7777',
    AUTH: {
      // Rutas actualizadas según el API Gateway real
      LOGIN: '/seguridad/usuarios/login',
      REGISTER: '/seguridad/usuarios/registro',
      LOGOUT: '/seguridad/usuarios/logout',
      REFRESH_TOKEN: '/seguridad/usuarios/refresh-token',
      VERIFY_TOKEN: '/seguridad/usuarios/verify-token'
    },
    USERS: {
      BASE: '/seguridad/usuarios',
      BY_ID: (id: string) => `/seguridad/usuarios/${id}`,
      CHANGE_PASSWORD: '/seguridad/usuarios/change-password'
    },
    ROLES: {
      BASE: '/seguridad/roles',
      BY_ID: (id: string) => `/seguridad/roles/${id}`,
      BY_NAME: (nombre: string) => `/seguridad/roles/nombre/${nombre}`,
      PERMISSIONS: (id: string) => `/seguridad/roles/${id}/permisos`,
      USERS: (id: string) => `/seguridad/roles/${id}/usuarios`
    },
    PERMISSIONS: {
      BASE: '/seguridad/permisos',
      BY_ID: (id: string) => `/seguridad/permisos/${id}`,
      BY_NAME: (nombre: string) => `/seguridad/permisos/nombre/${nombre}`
    },
    STATUS: {
      BASE: '/seguridad/estados',
      BY_ID: (id: string) => `/seguridad/estados/${id}`
    }
  },
  
  // Endpoints para el servicio financiero
  FINANCE_API: {
    BASE_URL: 'http://localhost:7777',
    ACCOUNTS: {
      BASE: '/finanzas/cuentas',
      BY_ID: (id: string) => `/finanzas/cuentas/${id}`,
      UPDATE_BALANCE: (id: string) => `/finanzas/cuentas/${id}/saldo`,
      ASSIGN_TO_USER: (idCuenta: string, idUsuario: string) => `/finanzas/cuentas/${idCuenta}/usuario/${idUsuario}`
    },
    POCKETS: {
      BASE: '/finanzas/bolsillos',
      BY_ID: (id: string) => `/finanzas/bolsillos/${id}`,
      ASSIGN_ACCOUNT: (idBolsillo: string, idCuenta: string) => `/finanzas/bolsillos/${idBolsillo}/cuenta/${idCuenta}`
    },
    TRANSACTIONS: {
      BASE: '/finanzas/transacciones',
      BY_ID: (id: string) => `/finanzas/transacciones/${id}`,
      CANCEL: (id: string) => `/finanzas/transacciones/${id}/anular`
    },
    TRANSACTION_TYPES: {
      BASE: '/finanzas/tipos-transaccion',
      BY_ID: (id: string) => `/finanzas/tipos-transaccion/${id}`
    },
    MOVEMENT_TYPES: {
      BASE: '/finanzas/tipos-movimiento',
      BY_ID: (id: string) => `/finanzas/tipos-movimiento/${id}`
    }
  }
};
