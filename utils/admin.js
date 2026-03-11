import { getApiBaseUrl, parseApiResponse } from './api';
import { getAuthToken } from './auth';

const ADMIN_KEY_STORAGE = 'growthinfra_admin_key';

export function getAdminKey() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(ADMIN_KEY_STORAGE) || '';
}

export function setAdminKey(value) {
  if (typeof window === 'undefined') return;
  if (value) {
    localStorage.setItem(ADMIN_KEY_STORAGE, value);
    return;
  }
  localStorage.removeItem(ADMIN_KEY_STORAGE);
}

export async function adminFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const adminKey = getAdminKey();
  const token = getAuthToken();
  if (adminKey) {
    headers['x-admin-key'] = adminKey;
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  });
  const data = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Admin request failed');
  }

  return data;
}
