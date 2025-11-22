import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      </form>
    </div>
  );
}

export default GenerarOT;