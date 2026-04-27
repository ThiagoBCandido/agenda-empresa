export const BACKEND_BASE_URL = getBackendBaseUrl();

export const API_ENDPOINTS = {
  auth: `${BACKEND_BASE_URL}/auth`,
  notes: `${BACKEND_BASE_URL}/notes`
} as const;

function getBackendBaseUrl(): string {
  const host = window.location.hostname;
  const isLocalHost = host === 'localhost' || host === '127.0.0.1';

  return isLocalHost
    ? 'http://localhost:8080'
    : 'https://agenda-empresa-backend.onrender.com';
}
