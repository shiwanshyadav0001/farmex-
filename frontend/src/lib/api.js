function normalizeUrl(url) {
  return url ? url.replace(/\/+$/, '') : '';
}

export function getBackendUrl() {
  const viteEnv =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL
      : '';

  const legacyEnv =
    typeof process !== 'undefined' && process.env ? process.env.REACT_APP_BACKEND_URL : '';

  if (typeof window !== 'undefined') {
    const { hostname, protocol, origin } = window.location;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

    if (isLocal) {
      return `${protocol}//${hostname}:8001`;
    }

    const configuredRemoteUrl = normalizeUrl(viteEnv || legacyEnv);
    return configuredRemoteUrl || normalizeUrl(origin);
  }

  return normalizeUrl(viteEnv || legacyEnv) || 'http://127.0.0.1:8001';
}

export const API = `${getBackendUrl()}/api`;
