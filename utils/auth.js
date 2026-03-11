const TOKEN_KEY = 'growthinfra_auth_token';
const USER_KEY = 'growthinfra_auth_user';

export function getAuthToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setAuthSession(token, user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isStoredUserAdmin() {
  const user = getStoredUser();
  return Boolean(user?.isAdmin);
}

export function isPublicSignupEnabled() {
  return String(process.env.NEXT_PUBLIC_ALLOW_SIGNUP || '').toLowerCase() === 'true';
}

export async function authFetch(path, options = {}) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${apiBase}${path}`, {
    ...options,
    headers,
  });
}
