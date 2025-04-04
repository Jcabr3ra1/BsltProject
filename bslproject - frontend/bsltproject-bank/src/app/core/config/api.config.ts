/**
 * System API Configuration
 * 
 * This file contains the base URLs for connecting to different
 * services through the API Gateway.
 * 
 * The API Gateway runs on port 7777 and routes requests to:
 * - Authentication Service: /seguridad/*
 * - Users Service: /seguridad/usuarios/*
 * - Finance Service: /cuentas/*, /transacciones/*, /transferencias/*, /operaciones-bancarias/*
 */

export const API_CONFIG = {
  // Central API Gateway that routes requests to microservices
  API_GATEWAY_URL: 'http://localhost:7777',
  
  // Authentication service endpoints
  AUTH_API: {
    BASE: '/seguridad/autenticacion',
    LOGIN: '/seguridad/autenticacion/login',
    REGISTER: '/seguridad/autenticacion/registro',
    LOGOUT: '/seguridad/autenticacion/cerrar-sesion',
    REFRESH_TOKEN: '/seguridad/autenticacion/refrescar-token',
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
    PROFILE: '/seguridad/usuarios/profile',
    UPDATE_PROFILE: '/seguridad/usuarios/profile/update',
    CHANGE_PASSWORD: '/seguridad/usuarios/profile/change-password'
  },
  
  // Finance service endpoints
  FINANCE_API: {
    ACCOUNTS: {
      BASE: '/cuentas',
      GET_BY_ID: (id: string) => `/cuentas/${id}`,
      CREATE: '/cuentas',
      UPDATE: (id: string) => `/cuentas/${id}`,
      DELETE: (id: string) => `/cuentas/${id}`
    },
    TRANSACTIONS: {
      BASE: '/transacciones',
      GET_BY_ID: (id: string) => `/transacciones/${id}`,
      CREATE: '/transacciones',
      UPDATE: (id: string) => `/transacciones/${id}`,
      DELETE: (id: string) => `/transacciones/${id}`,
      APPROVE: (id: string) => `/transacciones/${id}/aprobar`,
      REJECT: (id: string) => `/transacciones/${id}/rechazar`,
      CANCEL: (id: string) => `/transacciones/${id}/cancelar`
    },
    TRANSFERS: {
      BASE: '/transferencias',
      ACCOUNT_TO_ACCOUNT: '/transferencias/cuenta-cuenta',
      ACCOUNT_TO_POCKET: '/transferencias/cuenta-bolsillo',
      POCKET_TO_ACCOUNT: '/transferencias/bolsillo-cuenta'
    },
    BANK_OPERATIONS: {
      BASE: '/operaciones-bancarias',
      DEPOSIT_TO_ACCOUNT: '/operaciones-bancarias/consignar-cuenta',
      DEPOSIT_TO_POCKET: '/operaciones-bancarias/consignar-bolsillo',
      WITHDRAW_TO_BANK: '/operaciones-bancarias/retirar-banco'
    },
    POCKETS: {
      BASE: '/bolsillos',
      GET_BY_ID: (id: string) => `/bolsillos/${id}`,
      GET_BY_ACCOUNT: (accountId: string) => `/bolsillos/cuenta/${accountId}`,
      CREATE: '/bolsillos',
      UPDATE: (id: string) => `/bolsillos/${id}`,
      DELETE: (id: string) => `/bolsillos/${id}`
    },
    TRANSACTION_TYPES: {
      BASE: '/tipos-transaccion',
      GET_BY_ID: (id: string) => `/tipos-transaccion/${id}`
    },
    MOVEMENT_TYPES: {
      BASE: '/tipos-movimiento',
      GET_BY_ID: (id: string) => `/tipos-movimiento/${id}`
    }
  }
};
