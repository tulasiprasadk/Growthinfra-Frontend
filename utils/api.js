const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

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
  const provider_lower = provider.toLowerCase();
  window.location.href = `${API_BASE_URL}/api/social/connect/${provider_lower}`;
};

export default {
  initiateTwitterOAuth,
  initiateFacebookOAuth,
  initiateLinkedInOAuth,
  initiateInstagramOAuth,
  initiateOAuth,
};
