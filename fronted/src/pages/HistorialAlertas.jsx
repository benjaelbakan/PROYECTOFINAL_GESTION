import React, { useEffect, useState } from 'react';
import api, { fetchWithFallback } from '../api';

const HistorialAlertas = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overrideUrl, setOverrideUrl] = useState(() => {
    try { return localStorage.getItem('FRONTEND_BACKEND_URL') || ''; } catch (e) { return ''; }
  });
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // El endpoint real está montado en /api/alertas/notificaciones
        const res = await fetchWithFallback('/alertas/notificaciones');
        const data = res.data;
        if (data && data.ok) {
          setNotificaciones(data.notificaciones || []);
        } else {
          setError((data && data.error) || 'Error desconocido');
        }
      } catch (err) {
        // Mejor manejo de errores: si es respuesta HTML, indicar posible 404 de proxy
        const message = err && err.response ?
          `Request failed with status code ${err.response.status}` :
          (err && err.message) || String(err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const saveOverride = (val) => {
    try {
      if (val) localStorage.setItem('FRONTEND_BACKEND_URL', val);
      else localStorage.removeItem('FRONTEND_BACKEND_URL');
      setOverrideUrl(val || '');
    } catch (e) {
      console.warn('No se pudo guardar override:', e);
    }
  };

  const testOverride = async () => {
    setTesting(true);
    setError(null);
      try {
      // save temporarily so fetchWithFallback picks it up
      saveOverride(overrideUrl);
      // probar la ruta correcta montada en el router de alertas
      const res = await fetchWithFallback('/alertas/notificaciones');
      const data = res.data;
      if (data && data.ok) {
        setNotificaciones(data.notificaciones || []);
        setError(null);
      } else {
        setError((data && data.error) || 'Respuesta inválida');
      }
    } catch (err) {
      setError(err.response ? `Request failed with status code ${err.response.status}` : (err.message || String(err)));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 900, margin: '2rem auto' }}>
      <h2>Historial de Alertas/Notificaciones</h2>
      {loading && <p>Cargando...</p>}
      {error && (
        <div className="card bg-dark text-light border-secondary mb-3">
          <div className="card-body">
            <h5 className="card-title">Backend no accesible</h5>
            <p style={{ marginBottom: 8 }}>Error: {error}</p>
            <hr className="border-secondary" />
            <p className="mb-0">Pasos para solucionar:</p>
            <ol className="mt-2">
              <li>Asegúrate de que el backend esté corriendo en el puerto <code>3001</code> localmente.</li>
              <li>Si usas la versión publicada/preview del frontend, configura la variable de entorno <code>VITE_API_URL</code> apuntando a la URL pública del backend.</li>
            </ol>
            <div style={{ marginTop: 12 }}>
              <strong>Comandos útiles (en tu máquina):</strong>
              <pre style={{ background: '#0b0f14', color: '#cfe8ff', padding: 8, marginTop: 8 }}>
{`# Iniciar backend (carpeta backend)
cd /workspaces/PROYECTOFINAL_GESTION/backend
npm install
npm run dev

# Iniciar frontend en dev (carpeta fronted)
cd /workspaces/PROYECTOFINAL_GESTION/fronted
npm install
npm run dev
`}
              </pre>
              <p className="small mb-0">Si quieres, puedo configurar `VITE_API_URL` y/o mostrarte cómo desplegar el backend públicamente.</p>
              <div style={{ marginTop: 12 }}>
                <label className="small">URL alternativa (útil en preview):</label>
                <div className="d-flex gap-2" style={{ marginTop: 6 }}>
                  <input
                    className="form-control form-control-sm"
                    placeholder="https://mi-backend.ejemplo.com"
                    value={overrideUrl}
                    onChange={(e) => setOverrideUrl(e.target.value)}
                  />
                  <button className="btn btn-sm btn-primary" onClick={() => { saveOverride(overrideUrl); }}>
                    Guardar
                  </button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={testOverride} disabled={testing}>
                    {testing ? 'Probando...' : 'Probar ahora'}
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => { saveOverride(''); }}>
                    Limpiar
                  </button>
                </div>
                <p className="small text-muted mt-2 mb-0">Si apuntas a un backend local desde la nube, asegúrate de que la URL sea accesible desde tu navegador.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {!loading && !error && (
        <div className="card bg-dark border-secondary">
          <div className="card-body p-0">
            <table className="table table-dark table-striped table-hover mb-0" style={{ width: '100%', borderRadius: 8 }}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Asunto</th>
              <th>Destinatarios</th>
              <th>Enviado</th>
              <th>Alertas</th>
              <th>Proveedor</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {notificaciones.length === 0 && (
              <tr><td colSpan={6}>No hay notificaciones registradas.</td></tr>
            )}
            {notificaciones.map(n => (
              <tr key={n.id}>
                <td>{new Date(n.created_at).toLocaleString()}</td>
                <td>{n.asunto}</td>
                <td>{n.destinatarios}</td>
                <td>{n.enviado ? '✅' : '❌'}</td>
                <td>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {Array.isArray(n.alertas) && n.alertas.map((a, i) => (
                      <li key={i}><b>{a.activo}:</b> {a.mensaje}</li>
                    ))}
                  </ul>
                </td>
                <td style={{ color: '#aaa' }}>
                  {n.proveedor_respuesta ? (
                    typeof n.proveedor_respuesta === 'string' ? n.proveedor_respuesta : JSON.stringify(n.proveedor_respuesta)
                  ) : '-'}
                </td>
                <td style={{ color: n.error_envio ? 'orange' : '#aaa' }}>{n.error_envio || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialAlertas;
