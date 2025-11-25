// frontend/src/pages/GenerarOT.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function GenerarOT() {
  const navigate = useNavigate();

  // Lista de activos
  const [activos, setActivos] = useState([]);
  const [cargandoActivos, setCargandoActivos] = useState(true);
  const [errorActivos, setErrorActivos] = useState(null);

  // Formulario OT
  const [activoId, setActivoId] = useState("");
  const [tipo, setTipo] = useState("preventiva");
  const [fechaProgramada, setFechaProgramada] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [trabajadorAsignado, setTrabajadorAsignado] = useState("");

  // Mensajes
  const [mensaje, setMensaje] = useState(null);
  const [errorForm, setErrorForm] = useState(null);

  // Cargar activos al entrar a la página
  useEffect(() => {
    const cargarActivos = async () => {
      try {
        setCargandoActivos(true);
        setErrorActivos(null);

        const res = await fetch("/api/activos");
        if (!res.ok) throw new Error("No se pudieron cargar los activos");

        const data = await res.json();
        setActivos(data);

        // Si quieres seleccionar el primero por defecto:
        if (data.length > 0) {
          setActivoId(String(data[0].id));
        }
      } catch (err) {
        console.error("Error cargando activos:", err);
        setErrorActivos(err.message);
      } finally {
        setCargandoActivos(false);
      }
    };

    cargarActivos();
  }, []);

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setErrorForm(null);

    if (!activoId) {
      setErrorForm("Debes seleccionar un activo.");
      return;
    }
    if (!tipo || !descripcion.trim()) {
      setErrorForm("Tipo y descripción son obligatorios.");
      return;
    }

    try {
      const res = await fetch("/api/ot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activoId: Number(activoId),
          tipo,
          descripcion,
          fechaProgramada: fechaProgramada || null,
          trabajadorAsignado: trabajadorAsignado || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Error al crear la OT");
      }

      const data = await res.json();
      setMensaje(`OT #${data.id} creada correctamente.`);
      // Limpias solo algunos campos si quieres
      setDescripcion("");
      setTrabajadorAsignado("");
    } catch (err) {
      console.error("Error creando OT:", err);
      setErrorForm(err.message);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Generar Orden de Trabajo</h2>
        <button
          type="button"
          className="btn btn-outline-info btn-sm"
          onClick={() => navigate("/ot")}
        >
          Ver Órdenes de Trabajo
        </button>
      </div>

      {/* Mensajes */}
      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {errorForm && <div className="alert alert-danger">{errorForm}</div>}

      <div className="card bg-dark border-secondary">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Selección de activo */}
            <div className="mb-3">
              <label className="form-label">Activo</label>
              {cargandoActivos ? (
                <p className="text-muted mb-0">Cargando activos...</p>
              ) : errorActivos ? (
                <div className="alert alert-danger py-2 mb-0">
                  {errorActivos}
                </div>
              ) : activos.length === 0 ? (
                <p className="text-muted mb-0">
                  No hay activos registrados. Crea un activo primero.
                </p>
              ) : (
                <select
                  className="form-select bg-dark text-light border-secondary"
                  value={activoId}
                  onChange={(e) => setActivoId(e.target.value)}
                >
                  {activos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.id} – {a.codigo} ({a.marca} {a.modelo})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tipo de OT */}
            <div className="mb-3">
              <label className="form-label">Tipo de OT</label>
              <select
                className="form-select bg-dark text-light border-secondary"
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
                className="form-control bg-dark text-light border-secondary"
                value={fechaProgramada}
                onChange={(e) => setFechaProgramada(e.target.value)}
              />
            </div>

            {/* Descripción */}
            <div className="mb-3">
              <label className="form-label">Descripción del trabajo</label>
              <textarea
                className="form-control bg-dark text-light border-secondary"
                rows="3"
                placeholder="Ej. Cambio de aceite, revisión frenos, etc."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            {/* Trabajador asignado */}
            <div className="mb-3">
              <label className="form-label">Trabajador asignado</label>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary"
                placeholder="Ej. Juan Pérez"
                value={trabajadorAsignado}
                onChange={(e) => setTrabajadorAsignado(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-success"
              disabled={cargandoActivos || activos.length === 0}
            >
              Generar OT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GenerarOT;
