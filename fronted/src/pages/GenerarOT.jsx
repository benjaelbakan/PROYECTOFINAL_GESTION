import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailJSForm from "../components/EmailJSForm";

function GenerarOT() {
  const navigate = useNavigate();
  const [activoId, setActivoId] = useState("");
  const [tipo, setTipo] = useState("preventiva");
  const [descripcion, setDescripcion] = useState("");
  const [fechaProgramada, setFechaProgramada] = useState("");
  const [trabajador, setTrabajador] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    const nuevaOT = {
      activoId,
      tipo,
      descripcion,
      fechaProgramada,
      trabajadorAsignado: trabajador,
    };

    try {
      const res = await fetch("/api/ot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaOT),
      });

      if (!res.ok) {
        const dataError = await res.json().catch(() => ({}));
        throw new Error(dataError.message || "Error al guardar la OT");
      }

      const data = await res.json();
      console.log("OT creada:", data);
      setMensaje("Orden de trabajo creada correctamente.");
      // Prellenar el modal de EmailJS con la info básica
      setEmailModalData({
        to: '',
        subject: `Alerta: OT creada ${data.ot_id || ''}`,
        html: `
<div style="font-family: system-ui, sans-serif, Arial; font-size: 14px; color: #212121">
  <div style="max-width: 600px; margin: auto">
    <div style="text-align: center; background-color: #ffc002; padding: 32px 16px; border-radius: 32px 32px 0 0;">
      <a style="text-decoration: none; outline: none" href="https://tuservicio.example.com" target="_blank">
        <img style="height: 32px; vertical-align: middle" height="32" src="https://placehold.co/150x32?text=LOGO" alt="logo" />
      </a>
    </div>
    <div style="padding: 16px">
      <h1 style="font-size: 26px; margin-bottom: 26px">Mantenimiento próximo</h1>
      <p>Estimado usuario,</p>
      <p>
        Le informamos que el mantenimiento programado está próximo a realizarse. A continuación tienes los detalles de la orden:
      </p>
      <ul>
        <li><strong>ID OT:</strong> ${data.ot_id || 'N/A'}</li>
        <li><strong>Activo:</strong> ${activoId || 'N/A'}</li>
        <li><strong>Tipo:</strong> ${tipo}</li>
        <li><strong>Fecha programada:</strong> ${fechaProgramada || 'No definida'}</li>
      </ul>
      <p><strong>Descripción:</strong></p>
      <p>${descripcion || 'Sin descripción'}</p>
      <p style="text-align:center; margin-top:18px">Si necesitas cambiar la fecha, por favor responde a este correo o contacta al soporte.</p>
    </div>
    <div style="text-align: center; background-color: #ffc002; padding: 16px; border-radius: 0 0 32px 32px;">
      <p>Para cualquier consulta puedes contactarnos por teléfono</p>
      <p><strong><a href="tel:+56912345678" style="text-decoration:none; color:#212121">+56 9 1234 5678</a></strong></p>
      <p>o por email</p>
      <p><strong><a href="mailto:soporte@gestiona.local" style="text-decoration:none; color:#212121">soporte@gestiona.local</a></strong></p>
      <p style="font-size:12px; color:#333; margin-top:8px">Si no desea recibir estas notificaciones, puede <a href="{{user_unsubscribe}}" style="color:#212121">darse de baja</a>.</p>
    </div>
  </div>
</div>
        `
      });
      setShowEmailModal(true);
      // si quieres limpiar el formulario:
      // setActivoId("");
      // setTipo("preventiva");
      // setDescripcion("");
      // setFechaProgramada("");
      // setTrabajador("");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // EmailJS modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalData, setEmailModalData] = useState({ to: '', subject: '', html: '' });

  return (
    <div className="container mt-4">
      <h2>Generar Orden de Trabajo</h2>
      <button
        className="btn btn-outline-info mb-3"
        onClick={() => navigate("/ot")}
      >
        Ver Órdenes de Trabajo
      </button>

      {mensaje && <div className="alert alert-success py-2">{mensaje}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <form onSubmit={handleSubmit} className="mt-3">
        {/* ID / Código del activo */}
        <div className="mb-3">
          <label className="form-label">ID / Código del activo</label>
          <input
            type="text"
            className="form-control"
            value={activoId}
            onChange={(e) => setActivoId(e.target.value)}
            placeholder="Ej: 1, CAM-03, VEH-001..."
            required
          />
        </div>

        {/* Tipo de OT */}
        <div className="mb-3">
          <label className="form-label">Tipo de OT</label>
          <select
            className="form-select"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="preventiva">Preventiva</option>
            <option value="correctiva">Correctiva</option>
          </select>
        </div>

        {/* Fecha programada */}
        <div className="mb-3">
          <label className="form-label">Fecha programada</label>
          <input
            type="date"
            className="form-control"
            value={fechaProgramada}
            onChange={(e) => setFechaProgramada(e.target.value)}
          />
        </div>

        {/* Descripción */}
        <div className="mb-3">
          <label className="form-label">Descripción del trabajo</label>
          <textarea
            className="form-control"
            rows="3"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Cambio de aceite, revisión frenos, etc."
            required
          />
        </div>

        {/* Trabajador asignado */}
        <div className="mb-3">
          <label className="form-label">Trabajador asignado</label>
          <input
            type="text"
            className="form-control"
            value={trabajador}
            onChange={(e) => setTrabajador(e.target.value)}
            placeholder="Ej: Juan Pérez"
          />
        </div>

        <button type="submit" className="btn btn-success">
          Generar OT
        </button>
        <button
          type="button"
          className="btn btn-outline-primary ms-2"
          onClick={() => {
            // abrir modal con los datos actuales del formulario
            setEmailModalData({
              to: '',
              subject: `Alerta: OT para activo ${activoId || ''}`,
              html: `
<div style="font-family: system-ui, sans-serif, Arial; font-size: 14px; color: #212121">
  <div style="max-width: 600px; margin: auto">
    <div style="text-align: center; background-color: #ffc002; padding: 32px 16px; border-radius: 32px 32px 0 0;">
      <a style="text-decoration: none; outline: none" href="https://tuservicio.example.com" target="_blank">
        <img style="height: 32px; vertical-align: middle" height="32" src="https://placehold.co/150x32?text=LOGO" alt="logo" />
      </a>
    </div>
    <div style="padding: 16px">
      <h1 style="font-size: 26px; margin-bottom: 26px">Mantenimiento próximo</h1>
      <p>Se ha generado una orden de trabajo relacionada al activo <strong>${activoId || 'N/A'}</strong>.</p>
      <p><strong>Detalles rápidos:</strong></p>
      <ul>
        <li><strong>Tipo:</strong> ${tipo}</li>
        <li><strong>Fecha programada:</strong> ${fechaProgramada || 'No definida'}</li>
      </ul>
      <p><strong>Descripción:</strong></p>
      <p>${descripcion || 'Sin descripción'}</p>
    </div>
    <div style="text-align: center; background-color: #ffc002; padding: 16px; border-radius: 0 0 32px 32px;">
      <p>Para consultas: <strong><a href="mailto:soporte@gestiona.local" style="text-decoration:none; color:#212121">soporte@gestiona.local</a></strong></p>
    </div>
  </div>
</div>
              `
            });
            setShowEmailModal(true);
          }}
        >
          Enviar notificación (EmailJS)
        </button>
      </form>

      {showEmailModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 6, width: '90%', maxWidth: 720 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h5>Enviar notificación via EmailJS</h5>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowEmailModal(false)}>Cerrar</button>
            </div>
            <EmailJSForm defaultTo={emailModalData.to} defaultSubject={emailModalData.subject} defaultHtml={emailModalData.html} />
          </div>
        </div>
      )}
    </div>
  );
}

export default GenerarOT;