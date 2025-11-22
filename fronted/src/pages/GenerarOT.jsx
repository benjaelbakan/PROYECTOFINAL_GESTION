import { useState } from "react";

function GenerarOT() {
  // Estados del formulario
  const [activoId, setActivoId] = useState("");
  const [tipo, setTipo] = useState("preventiva");
  const [descripcion, setDescripcion] = useState("");
  const [fechaProgramada, setFechaProgramada] = useState("");
  const [mensaje, setMensaje] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault(); // evita que se recargue la página

    // Objeto OT que enviaríamos al backend
    const nuevaOT = {
      activoId,
      tipo,
      descripcion,
      fechaProgramada,
    };

    console.log("OT a enviar:", nuevaOT);

    // de momento solo mostramos un mensaje local
    setMensaje("OT generada (simulada). Después la enviaremos al backend.");

    // opcional: limpiar formulario
    // setActivoId("");
    // setTipo("preventiva");
    // setDescripcion("");
    // setFechaProgramada("");
  };

  return (
    <div className="container mt-4">
      <h2>Generar Orden de Trabajo</h2>
      <p className="text-muted">
        Aquí después conectaremos este formulario con el backend para crear la OT de verdad.
      </p>

      {mensaje && (
        <div className="alert alert-success py-2">
          {mensaje}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-3">
        {/* ID o código del activo */}
        <div className="mb-3">
          <label className="form-label">ID / Código del activo</label>
          <input
            type="text"
            className="form-control"
            value={activoId}
            onChange={(e) => setActivoId(e.target.value)}
            placeholder="Ej: 12, CAM-03, VEH-001..."
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

        <button type="submit" className="btn btn-success">
          Generar OT
        </button>
      </form>
    </div>
  );
}

export default GenerarOT;
