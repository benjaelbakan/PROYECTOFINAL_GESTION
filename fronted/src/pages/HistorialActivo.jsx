// frontend/src/pages/HistorialActivo.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const MESES = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

function HistorialActivo() {
  const { id: paramId } = useParams();        // puede venir desde /activos/:id/historial
  const navigate = useNavigate();

  // lista de activos para el combo
  const [activos, setActivos] = useState([]);
  const [activoId, setActivoId] = useState(paramId || "");

  // filtros
  const [anio, setAnio] = useState("");
  const [mes, setMes] = useState("");
  const [tipo, setTipo] = useState("");

  // datos
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // AÑOS (por ahora pongo un rango fijo, puedes ajustarlo)
  const aniosDisponibles = [];
  for (let y = 2023; y <= 2030; y++) {
    aniosDisponibles.push(y);
  }

  // Cargar lista de activos al entrar
  useEffect(() => {
    const fetchActivos = async () => {
      try {
        const res = await fetch("/api/activos");
        const data = await res.json();
        setActivos(data);

        // Si venimos desde /activos/:id/historial y ese ID existe, lo dejamos seleccionado
        if (paramId && data.some((a) => String(a.id) === String(paramId))) {
          setActivoId(paramId);
        }
      } catch (err) {
        console.error("Error cargando activos:", err);
        setError("No se pudieron cargar los activos.");
      }
    };

    fetchActivos();
  }, [paramId]);

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      setError(null);

      if (!activoId) {
        setRegistros([]);
        setError("Selecciona un activo para ver su historial.");
        return;
      }

      const params = new URLSearchParams();
      if (anio) params.append("anio", anio);
      if (mes) params.append("mes", mes);
      if (tipo && tipo !== "todos") params.append("tipo", tipo);

      const qs = params.toString();
      const url = qs
        ? `/api/activos/${activoId}/historial?${qs}`
        : `/api/activos/${activoId}/historial`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al cargar historial");

      const data = await res.json();
      setRegistros(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cargar historial");
    } finally {
      setCargando(false);
    }
  };

  // cargar historial automáticamente cuando cambie el activo
  useEffect(() => {
    if (activoId) {
      cargarHistorial();
    } else {
      setRegistros([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activoId]);

  const limpiarFiltros = () => {
    setAnio("");
    setMes("");
    setTipo("");
    if (activoId) {
      cargarHistorial();
    }
  };

  return (
    <div className="container mt-3">
      <button
        className="btn btn-outline-light mb-3"
        onClick={() => navigate(-1)}
      >
        ← Volver
      </button>

      <h2>Historial de mantenimiento</h2>

      {/* Filtros */}
      <div className="card bg-dark border-secondary mt-3 mb-3">
        <div className="card-body">
          <div className="row g-2">
            {/* Selección de activo */}
            <div className="col-md-4">
              <label className="form-label">Activo</label>
              <select
                className="form-select"
                value={activoId}
                onChange={(e) => setActivoId(e.target.value)}
              >
                <option value="">Seleccione un activo…</option>
                {activos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} - {a.codigo} ({a.marca} {a.modelo})
                  </option>
                ))}
              </select>
            </div>

            {/* Año */}
            <div className="col-md-2">
              <label className="form-label">Año</label>
              <select
                className="form-select"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              >
                <option value="">Todos</option>
                {aniosDisponibles.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Mes */}
            <div className="col-md-3">
              <label className="form-label">Mes</label>
              <select
                className="form-select"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
              >
                <option value="">Todos</option>
                {MESES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo OT */}
            <div className="col-md-3">
              <label className="form-label">Tipo de OT</label>
              <select
                className="form-select"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="preventiva">Preventiva</option>
                <option value="correctiva">Correctiva</option>
              </select>
            </div>
          </div>

          <div className="row g-2 mt-3">
            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-primary me-2"
                type="button"
                onClick={cargarHistorial}
                disabled={!activoId}
              >
                Aplicar filtros
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={limpiarFiltros}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {cargando ? (
        <p className="text-muted">Cargando historial...</p>
      ) : !activoId ? (
        <p className="text-muted">
          Selecciona un activo para ver su historial de mantenimiento.
        </p>
      ) : registros.length === 0 ? (
        <p className="text-muted">
          No hay registros de mantenimiento para los filtros seleccionados.
        </p>
      ) : (
        <div className="table-responsive">
          <table className="table table-dark table-hover table-sm align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>OT</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Registrado</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.ot_id}</td>
                  <td>{r.tipo}</td>
                  <td>{r.descripcion}</td>
                  <td>
                    {r.fecha
                      ? new Date(r.fecha).toLocaleDateString("es-CL")
                      : "-"}
                  </td>
                  <td>
                    {r.creado_en
                      ? new Date(r.creado_en).toLocaleString("es-CL")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HistorialActivo;
