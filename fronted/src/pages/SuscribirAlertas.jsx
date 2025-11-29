import { useState } from 'react';
import api, { fetchWithFallback } from '../api';

export default function SuscribirAlertas() {
  const [email, setEmail] = useState('');
  const [activoId, setActivoId] = useState('');
  const [nombre, setNombre] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const payload = {
        email,
        nombre: nombre || undefined,
        activo_id: activoId ? Number(activoId) : null,
      };
      // Enviar usando fetchWithFallback para soportar preview/local
      const r = await fetchWithFallback('/alertas/suscribirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: payload,
      });
      const data = r.data || {};
      if (data.ok) {
        setStatus({ ok: true, message: data.message || 'Suscripción registrada' });
        setEmail('');
        setActivoId('');
        setNombre('');
      } else {
        setStatus({ ok: false, message: data.message || data.error || 'Error al suscribir' });
      }
    } catch (err) {
      setStatus({ ok: false, message: err?.response?.data?.message || err?.message || 'Error al suscribir' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-dark border-secondary">
      <div className="card-header border-secondary">
        <h5 className="mb-0">Suscribirse a alertas de mantenimiento</h5>
      </div>
      <div className="card-body">
        <form onSubmit={onSubmit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-control bg-dark text-light border-secondary"
              placeholder="usuario@dominio.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Nombre (opcional)</label>
            <input
              type="text"
              className="form-control bg-dark text-light border-secondary"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">ID de Activo (opcional)</label>
            <input
              type="number"
              className="form-control bg-dark text-light border-secondary"
              placeholder="Ej: 123 (si quieres suscribirte a un activo específico)"
              value={activoId}
              onChange={(e) => setActivoId(e.target.value)}
            />
            <small className="text-secondary">
              Si lo dejas vacío, recibirás alertas de todos los activos.
            </small>
          </div>
          <div className="col-12 d-flex align-items-center">
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : 'Suscribirse'}
            </button>
          </div>
        </form>

        {status && (
          <div className={`alert mt-3 ${status.ok ? 'alert-success' : 'alert-danger'}`}>
            {status.message}
          </div>
        )}

        <div className="mt-4">
          <div className="card bg-secondary text-light">
            <div className="card-body">
              <h6>¿Cómo funciona?</h6>
              <ul className="mb-0">
                <li>Tu correo se guarda en la tabla <code>suscriptores</code> del backend.</li>
                <li>Si proporcionas <code>ID de Activo</code>, sólo recibirás alertas de ese activo; si lo omites, recibirás todas.</li>
                <li>En desarrollo, si no configuras SMTP, el sistema usa Ethereal (no envía emails reales, pero puedes abrir el preview).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
