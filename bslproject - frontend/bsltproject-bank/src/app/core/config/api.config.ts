/**
 * System API Configuration
 * 
 * This file contains the base URLs for connecting to different
 * services through the API Gateway.
 */

export const API_CONFIG = {
  // Central API Gateway that routes requests to microservices
  API_GATEWAY_URL: 'http://localhost:7777',
  
  // Authentication service endpoints
  AUTH_API: {
    BASE: '/seguridad/autenticacion',
    LOGIN: '/seguridad/autenticacion/login',
    REGISTER: '/seguridad/autenticacion/registro',
    LOGOUT: '/seguridad/cerrar-sesion',
    VERIFY_TOKEN: '/seguridad/autenticacion/verificar-token'
  },
  
  // Users service endpoints
  USERS_API: {
    BASE: '/seguridad/usuarios',
    GET_ALL: '/seguridad/usuarios',
    GET_BY_ID: (id: string) => `/seguridad/usuarios/${id}`,
    CREATE: '/seguridad/usuarios',
    UPDATE: (id: string) => `/seguridad/usuarios/${id}`,
    DELETE: (id: string) => `/seguridad/usuarios/${id}`,
    ASSIGN_ROLE: (userId: string, roleId: string) => `/seguridad/usuarios/${userId}/roles/${roleId}`,
    ASSIGN_STATE: (userId: string, stateId: string) => `/seguridad/usuarios/${userId}/estados/${stateId}`,
    ASSIGN_ACCOUNT: (userId: string, accountId: string) => `/seguridad/usuarios/${userId}/cuentas/${accountId}`
  },
  
  // Finance service endpoints
  FINANCE_API: {
    ACCOUNTS: {
      BASE: '/finanzas/cuentas',
      GET_BY_ID: (id: string) => `/finanzas/cuentas/${id}`,
      CREATE: '/finanzas/cuentas',
      UPDATE: (id: string) => `/finanzas/cuentas/${id}`,
      DELETE: (id: string) => `/finanzas/cuentas/${id}`,
      GET_BY_USER: (userId: string) => `/finanzas/cuentas/usuario/${userId}`
    },
    TRANSACTIONS: {
      BASE: '/finanzas/transacciones',
      GET_BY_ID: (id: string) => `/finanzas/transacciones/${id}`,
      CREATE: '/finanzas/transacciones',
      CANCEL: (id: string) => `/finanzas/transacciones/${id}/cancel`,
      GET_BY_USER: (userId: string) => `/finanzas/transacciones/usuario/${userId}`,
      HISTORY: '/finanzas/transacciones/historial'
    },
    TRANSFERS: {
      ACCOUNT_TO_ACCOUNT: '/finanzas/transferencias/cuenta-cuenta',
      ACCOUNT_TO_POCKET: '/finanzas/transferencias/cuenta-bolsillo',
      POCKET_TO_ACCOUNT: '/finanzas/transferencias/bolsillo-cuenta'
    },
    CONSIGNATIONS: {
      BANK_TO_ACCOUNT: '/finanzas/consignaciones/banco-cuenta',
      BANK_TO_POCKET: '/finanzas/consignaciones/banco-bolsillo'
    },
    WITHDRAWALS: {
      ACCOUNT_TO_BANK: '/finanzas/retiros/cuenta-banco'
    },
    POCKETS: {
      BASE: '/finanzas/bolsillos',
      GET_BY_ID: (id: string) => `/finanzas/bolsillos/${id}`,
      CREATE: '/finanzas/bolsillos',
      UPDATE: (id: string) => `/finanzas/bolsillos/${id}`,
      DELETE: (id: string) => `/finanzas/bolsillos/${id}`,
      ASSIGN_ACCOUNT: (pocketId: string, accountId: string) => `/finanzas/bolsillos/${pocketId}/cuentas/${accountId}`
    },
    MOVEMENT_TYPES: {
      BASE: '/finanzas/tipos-movimiento',
      GET_BY_ID: (id: string) => `/finanzas/tipos-movimiento/${id}`,
      CREATE: '/finanzas/tipos-movimiento',
      UPDATE: (id: string) => `/finanzas/tipos-movimiento/${id}`,
      DELETE: (id: string) => `/finanzas/tipos-movimiento/${id}`
    },
    TRANSACTION_TYPES: {
      BASE: '/finanzas/tipos-transaccion',
      GET_BY_ID: (id: string) => `/finanzas/tipos-transaccion/${id}`,
      CREATE: '/finanzas/tipos-transaccion',
      UPDATE: (id: string) => `/finanzas/tipos-transaccion/${id}`,
      DELETE: (id: string) => `/finanzas/tipos-transaccion/${id}`
    }
  }
};