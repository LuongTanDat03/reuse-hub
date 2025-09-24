// API Constants
export const API_BASE_URL = 'http://localhost:8080/api/v1';

export const API_ENDPOINTS = {
  LOGIN: '/identity/auth/login',
  REGISTER: '/identity/auth/register',
  LOGOUT: '/identity/auth/logout',
  VERIFY_EMAIL: '/identity/auth/confirm',
  INTROSPECT: '/identity/auth/introspect',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  DISABLED: 'DISABLED',
} as const;

export const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;


