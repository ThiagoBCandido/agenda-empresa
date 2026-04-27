export const BACKEND_BASE_URL = 'http://localhost:8080';

export const API_ENDPOINTS = {
  auth: `${BACKEND_BASE_URL}/auth`,
  notes: `${BACKEND_BASE_URL}/notes`,
} as const;