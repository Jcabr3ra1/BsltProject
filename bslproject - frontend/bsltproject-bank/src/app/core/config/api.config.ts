/**
 * System API Configuration
 * 
 * This file contains the base URLs for connecting to different
 * services through the API Gateway.
 * 
 * The API Gateway runs on port 7777 and routes requests to:
 * - Security Service: /seguridad/*
 * - Finance Service: /finanzas/*
 */

export const API_CONFIG = {
  // Central API Gateway that routes requests to microservices
  API_GATEWAY_URL: 'http://localhost:7777',
  
  // Security service endpoints
  SECURITY_API: {
    BASE_URL: '/seguridad',
    AUTH: {
      LOGIN: '/seguridad/usuarios/login',
      REGISTER: '/seguridad/usuarios/registro',
      REFRESH: '/seguridad/usuarios/refresh'
    },
    USERS: {
      BASE: '/seguridad/usuarios',
      BY_ID: (id: string) => `/seguridad/usuarios/${id}`,
      ASSIGN_ROLE: (userId: string, roleId: string) => `/seguridad/usuarios/${userId}/asignar-rol/${roleId}`,
      ASSIGN_STATE: (userId: string, stateId: string) => `/seguridad/usuarios/${userId}/asignar-estado/${stateId}`
    },
    ROLES: {
      BASE: '/seguridad/roles',
      BY_ID: (id: string) => `/seguridad/roles/${id}`,
      BY_NAME: (name: string) => `/seguridad/roles/nombre/${name}`,
      PERMISSIONS: (id: string) => `/seguridad/roles/${id}/permisos`,
      USERS: (id: string) => `/seguridad/roles/${id}/usuarios`
    },
    PERMISSIONS: {
      BASE: '/seguridad/permisos',
      BY_ID: (id: string) => `/seguridad/permisos/${id}`,
      BY_NAME: (name: string) => `/seguridad/permisos/nombre/${name}`
    },
    STATES: {
      BASE: '/seguridad/estados',
      BY_ID: (id: string) => `/seguridad/estados/${id}`
    }
  },
  
  // Finance service endpoints
  FINANCE_API: {
    BASE_URL: '/finanzas',
    ACCOUNTS: {
      BASE: '/finanzas/cuentas',
      BY_ID: (id: string) => `/finanzas/cuentas/${id}`,
      UPDATE_BALANCE: (id: string) => `/finanzas/cuentas/${id}/saldo`,
      ASSIGN_TO_USER: (accountId: string, userId: string) => `/finanzas/cuentas/${accountId}/asignar-usuario/${userId}`
    },
    POCKETS: {
      BASE: '/finanzas/bolsillos',
      BY_ID: (id: string) => `/finanzas/bolsillos/${id}`,
      ASSIGN_ACCOUNT: (pocketId: string, accountId: string) => `/finanzas/bolsillos/${pocketId}/cuenta/${accountId}`
    },
    TRANSACTIONS: {
      BASE: '/finanzas/transacciones',
      BY_ID: (id: string) => `/finanzas/transacciones/${id}`,
      CANCEL: (id: string) => `/finanzas/transacciones/${id}/anular`,
      HISTORY: '/finanzas/transacciones/historial'
    },
    TRANSACTION_TYPES: {
      BASE: '/finanzas/tipos-transaccion',
      BY_ID: (id: string) => `/finanzas/tipos-transaccion/${id}`
    },
    MOVEMENT_TYPES: {
      BASE: '/finanzas/tipos-movimiento',
      BY_ID: (id: string) => `/finanzas/tipos-movimiento/${id}`
    },
    TRANSFERS: {
      ACCOUNT_TO_ACCOUNT: '/finanzas/transferencias/cuenta-cuenta',
      ACCOUNT_TO_POCKET: '/finanzas/transferencias/cuenta-bolsillo',
      POCKET_TO_ACCOUNT: '/finanzas/transferencias/bolsillo-cuenta'
    },
    BANK_OPERATIONS: {
      DEPOSIT_TO_ACCOUNT: '/finanzas/consignaciones/banco-cuenta',
      DEPOSIT_TO_POCKET: '/finanzas/consignaciones/banco-bolsillo',
      WITHDRAW_TO_BANK: '/finanzas/retiros/cuenta-banco'
    }
  }
};
