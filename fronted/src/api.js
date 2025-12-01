import axios from 'axios';

// Vite env: VITE_API_URL can be set to the full backend URL (no trailing slash)
const raw = import.meta.env.VITE_API_URL || '';
const base = raw ? (raw.replace(/\/$/, '') + '/api') : '/api';

const api = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' },
});

// Agregar interceptor para incluir Authorization Bearer desde localStorage si existe
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  } catch (e) {
    // ignore
  }
  return config;
});

// Attempts to fetch an endpoint using several fallbacks:
// 1) same-origin (axios instance `api`)
// 2) VITE_API_URL (if set)
// 3) http://127.0.0.1:3001 (common local backend)
export async function fetchWithFallback(endpoint, config = {}) {
  // Normalize endpoint leading slash
  const ep = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Helper to detect HTML responses (e.g. a 404 page served as HTML)
  const looksLikeHtml = (data) => typeof data === 'string' && data.trim().startsWith('<');

  // Determine method and payload
  const method = (config.method || 'GET').toUpperCase();

  // 1) try the configured axios instance (same-origin or VITE-based base)
  try {
    const r = await api.request({ url: ep, method, ...config });
    if (looksLikeHtml(r.data)) throw new Error('Respuesta HTML detectada');
    return r;
  } catch (err) {
    // continue to fallbacks
  }

  const candidates = [];
  // 0) runtime override from localStorage (useful when running preview)
  try {
    const runtime = localStorage.getItem('FRONTEND_BACKEND_URL') || '';
    if (runtime) candidates.push(runtime.replace(/\/$/, '') + '/api');
  } catch (e) {
    // ignore (e.g. SSR or restricted env)
  }
  // 1) Vite env
  if (raw) candidates.push(raw.replace(/\/$/, '') + '/api');
  // 2) common local fallback
  candidates.push('http://127.0.0.1:3001/api');

  const axiosInstance = axios;
  let lastErr = null;
  for (const baseUrl of candidates) {
    try {
      const url = baseUrl + ep;
      const r = await axiosInstance.request({ url, method, ...config });
      if (looksLikeHtml(r.data)) throw new Error('Respuesta HTML detectada');
      return r;
    } catch (err) {
      lastErr = err;
      // try next
    }
  }

  // Si llegó acá, todo falló
  throw lastErr || new Error('No se pudo contactar al backend');
}

export default api;
