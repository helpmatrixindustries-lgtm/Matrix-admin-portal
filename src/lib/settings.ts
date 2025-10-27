/**
 * Get the verification base URL from settings
 * Falls back to default if not configured
 */
export const getVerificationBaseUrl = (): string => {
  const savedUrl = localStorage.getItem('verification_base_url');
  return savedUrl || 'https://matrixindustries.in/verify';
};

/**
 * Generate full verification URL with code
 */
export const getVerificationUrl = (documentId: string): string => {
  const baseUrl = getVerificationBaseUrl();
  return `${baseUrl}?code=${documentId}`;
};

/**
 * Set the verification base URL
 */
export const setVerificationBaseUrl = (url: string): void => {
  // Remove trailing slash
  const cleanUrl = url.replace(/\/$/, '');
  localStorage.setItem('verification_base_url', cleanUrl);
};
