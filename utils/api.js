const PROD_API_BASE_URL = 'https://signalflow-backend.vercel.app';

export const getApiBaseUrl = () => {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  if (typeof window !== 'undefined' && window.location.hostname.includes('signalflow-frontend')) {
    return PROD_API_BASE_URL;
  }

  return '';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Initiate Twitter OAuth login flow
 * Redirects to backend OAuth endpoint
 */
export const initiateTwitterOAuth = () => {
  window.location.href = `${API_BASE_URL}/api/social/connect/twitter`;
};

/**
 * Initiate Facebook OAuth login flow
 */
export const initiateFacebookOAuth = () => {
  window.location.href = `${API_BASE_URL}/api/social/connect/facebook`;
};

/**
 * Initiate LinkedIn OAuth login flow
 */
export const initiateLinkedInOAuth = () => {
  window.location.href = `${API_BASE_URL}/api/social/connect/linkedin`;
};

/**
 * Initiate Instagram OAuth login flow (via Facebook)
 */
export const initiateInstagramOAuth = () => {
  window.location.href = `${API_BASE_URL}/api/social/connect/instagram`;
};

/**
 * Generic OAuth initiator
 */
export const initiateOAuth = (provider) => {
  const providerLower = provider.toLowerCase();
  window.location.href = `${API_BASE_URL}/api/social/connect/${providerLower}`;
};

export async function parseApiResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    if (!response.ok) {
      throw new Error(text || `Request failed with status ${response.status}`);
    }

    return { raw: text };
  }
}

export default {
  getApiBaseUrl,
  initiateTwitterOAuth,
  initiateFacebookOAuth,
  initiateLinkedInOAuth,
  initiateInstagramOAuth,
  initiateOAuth,
  parseApiResponse,
};
