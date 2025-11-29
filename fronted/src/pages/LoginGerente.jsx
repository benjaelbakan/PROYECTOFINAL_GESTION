import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { fetchWithFallback } from '../api';

export default function LoginGerente() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    let attempts = 0;
    const maxAttempts = 3;
    try {
      // Reintentos automáticos para problemas de red (corto backoff)
      while (attempts < maxAttempts) {
        attempts += 1;
        try {
          const r = await fetchWithFallback('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: { email, password },
            timeout: 8000,
          });
          const res = r.data || {};
          if (r.status === 401) {
            setError('Credenciales inválidas');
            break;
          }
          if (r.status === 403) {
            setError('Acceso denegado');
            break;
          }
          if (res && res.ok) {
            localStorage.setItem('auth_token', res.token);
            localStorage.setItem('auth_user', JSON.stringify(res.user));
            navigate('/gerente');
            return;
          }
          // respuesta no-ok sin status: mostrar mensaje
          setError(res && res.message ? res.message : 'Credenciales inválidas');
          break;
        } catch (innerErr) {
          // Si es error con respuesta, no reintentar (ej. 4xx, 5xx)
          if (innerErr && innerErr.response) {
            const st = innerErr.response.status;
            if (st === 401) setError('Credenciales inválidas');
            else if (st === 403) setError('Acceso denegado');
            else setError(innerErr.response.data?.message || `Error del servidor (${st})`);
            break;
          }
          // Error de red / timeout: reintentar
          if (attempts < maxAttempts) {
            setError(`Error de red. Reintentando (${attempts}/${maxAttempts})...`);
            await new Promise(r => setTimeout(r, 800 * attempts));
            continue;
          }
          // último intento falló
          setError(innerErr && innerErr.message ? `Network Error: ${innerErr.message}` : 'No se pudo contactar al backend');
        }
      }
    } catch (err) {
      // Mostrar mensajes más explícitos para problemas de red/CORS
      if (err && err.response) {
        setError(err.response.data?.message || `Error ${err.response.status}`);
      } else if (err && err.message) {
        setError(`Network Error: ${err.message}`);
      } else {
        setError('No se pudo contactar al backend');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 500, marginTop: 40 }}>
      <div className="card bg-dark border-secondary p-4">
        <h4>Login Gerente</h4>
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control bg-dark text-light border-secondary" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control bg-dark text-light border-secondary" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="d-flex justify-content-between">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => { localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user'); navigate('/'); }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
