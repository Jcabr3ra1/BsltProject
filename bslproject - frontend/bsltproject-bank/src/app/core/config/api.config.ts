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
    BASE_URL: 'http://localhost:7777/seguridad',
    AUTH: {
      LOGIN: 'http://localhost:7777/seguridad/autenticacion/login',
      REGISTER: 'http://localhost:7777/seguridad/autenticacion/registro',
      LOGOUT: 'http://localhost:7777/seguridad/cerrar-sesion'
    },
    USERS: {
      BASE: 'http://localhost:7777/seguridad/usuarios',
      BY_ID: (id: string) => `http://localhost:7777/seguridad/usuarios/${id}`,
      ASSIGN_ROLE: (userId: string, roleId: string) => `http://localhost:7777/seguridad/usuarios/${userId}/roles/${roleId}`,
      ASSIGN_STATE: (userId: string, stateId: string) => `http://localhost:7777/seguridad/usuarios/${userId}/status/${stateId}`
    },
    ACTIVATION: {
      ACTIVATE_ADMIN: 'http://localhost:7777/seguridad/activacion/activar-admin',
      ACTIVATE_USER: 'http://localhost:7777/seguridad/activacion/activar-usuario'
    },
    ROLES: {
      BASE: 'http://localhost:7777/seguridad/roles',
      BY_ID: (id: string) => `http://localhost:7777/seguridad/roles/${id}`,
      BY_NAME: (name: string) => `http://localhost:7777/seguridad/roles/nombre/${name}`,
      PERMISSIONS: (id: string) => `http://localhost:7777/seguridad/roles/${id}/permisos`,
      USERS: (id: string) => `http://localhost:7777/seguridad/roles/${id}/usuarios`
    },
    PERMISSIONS: {
      BASE: 'http://localhost:7777/seguridad/permisos',
      BY_ID: (id: string) => `http://localhost:7777/seguridad/permisos/${id}`,
      BY_NAME: (name: string) => `http://localhost:7777/seguridad/permisos/nombre/${name}`
    },
    STATES: {
      BASE: 'http://localhost:7777/seguridad/estados',
      BY_ID: (id: string) => `http://localhost:7777/seguridad/estados/${id}`
    }
  },
  
  // Finance service endpoints
  FINANCE_API: {
    BASE_URL: 'http://localhost:7777/finanzas',
    ACCOUNTS: {
      BASE: 'http://localhost:7777/finanzas/cuentas',
      BY_ID: (id: string) => `http://localhost:7777/finanzas/cuentas/${id}`,
      UPDATE_BALANCE: (id: string) => `http://localhost:7777/finanzas/cuentas/${id}/saldo`,
      ASSIGN_TO_USER: (accountId: string, userId: string) => `http://localhost:7777/finanzas/cuentas/${accountId}/usuarios/${userId}`
    },
    POCKETS: {
      BASE: 'http://localhost:7777/finanzas/bolsillos',
      BY_ID: (id: string) => `http://localhost:7777/finanzas/bolsillos/${id}`,
      ASSIGN_ACCOUNT: (pocketId: string, accountId: string) => `http://localhost:7777/finanzas/bolsillos/${pocketId}/cuentas/${accountId}`
    },
    TRANSACTIONS: {
      BASE: 'http://localhost:7777/finanzas/transacciones',
      BY_ID: (id: string) => `http://localhost:7777/finanzas/transacciones/${id}`,
      CANCEL: (id: string) => `http://localhost:7777/finanzas/transacciones/${id}/cancelar`,
      HISTORY: 'http://localhost:7777/finanzas/transacciones/historial'
    },
    TRANSACTION_TYPES: {
      BASE: 'http://localhost:7777/finanzas/tipos-transaccion',
      BY_ID: (id: string) => `http://localhost:7777/finanzas/tipos-transaccion/${id}`
    },
    MOVEMENT_TYPES: {
      BASE: 'http://localhost:7777/finanzas/tipos-movimiento',
      BY_ID: (id: string) => `http://localhost:7777/finanzas/tipos-movimiento/${id}`
    },
    TRANSFERS: {
      ACCOUNT_TO_ACCOUNT: 'http://localhost:7777/finanzas/transferencias/cuenta-cuenta',
      ACCOUNT_TO_POCKET: 'http://localhost:7777/finanzas/transferencias/cuenta-bolsillo',
      POCKET_TO_ACCOUNT: 'http://localhost:7777/finanzas/transferencias/bolsillo-cuenta'
    },
    DEPOSITS: {
      BANK_TO_ACCOUNT: 'http://localhost:7777/finanzas/consignaciones/banco-cuenta',
      BANK_TO_POCKET: 'http://localhost:7777/finanzas/consignaciones/banco-bolsillo'
    },
    WITHDRAWALS: {
      ACCOUNT_TO_BANK: 'http://localhost:7777/finanzas/retiros/cuenta-banco'
    }
  }
};
