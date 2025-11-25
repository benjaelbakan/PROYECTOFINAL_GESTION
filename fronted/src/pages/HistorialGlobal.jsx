// frontend/src/pages/HistorialGlobal.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function HistorialGlobal() {
  const navigate = useNavigate();

  const [activos, setActivos] = useState([]);
  const [activoId, setActivoId] = useState("");

  const [anio, setAnio] = useState("");
  const [mes, setMes] = useState(""); // 1-12 o ""

  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // --------------------- helpers ---------------------
  const formatFecha = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-CL");
  };

  const calcularRangoFechas = () => {
    // sin año -> sin filtros de fecha
    if (!anio) return { desde: null, hasta: null };

    // año completo
    if (!mes) {
      return {
        desde: `${anio}-01-01`,
        hasta: `${anio}-12-31`,
      };
    }

    // mes específico
    const monthNumber = Number(mes); // 1–12
    const ultimoDia = new Date(Number(anio), monthNumber, 0).getDate(); // truco JS

    const mesStr = String(monthNumber).padStart(2, "0");
    return {
      desde: `${anio}-${mesStr}-01`,
      hasta: `${anio}-${mesStr}-${ultimoDia}`,
    };
  };

  const cargarActivos = async () => {
    try {
      setError(null);
      const res = await fetch("/api/activos");
      if (!res.ok) throw new Error("No se pudieron cargar los activos");
      const data = await res.json();
      setActivos(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const cargarHistorial = async () => {
    try {
      setError(null);

      if (!activoId) {
        setRegistros([]);
        setError("Selecciona un activo para ver el historial.");
        return;
      }

      setCargando(true);

      const params = new URLSearchParams();
      const { desde, hasta } = calcularRangoFechas();

      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);

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
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // cargar lista de activos al entrar
  useEffect(() => {
    cargarActivos();
  }, []);

  // cuando el usuario cambia de activo, cargamos historial automáticamente
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
    setError(null);
    if (activoId) {
      cargarHistorial();
    } else {
      setRegistros([]);
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
          <div className="row g-3">
            {/* Activo */}
            <div className="col-md-4">
              <label className="form-label">Activo</label>
              <select
                className="form-select bg-dark text-light border-secondary"
                value={activoId}
                onChange={(e) => setActivoId(e.target.value)}
              >
                <option value="">Selecciona un activo...</option>
                {activos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} - {a.codigo} ({a.marca} {a.modelo})
                  </option>
                ))}
              </select>
            </div>

            {/* Año */}
            <div className="col-md-3">
              <label className="form-label">Año</label>
              <input
                type="number"
                className="form-control bg-dark text-light border-secondary"
                placeholder="Ej: 2025"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              />
              <small className="text-muted">
                Si dejas vacío, verás todos los años.
              </small>
            </div>

            {/* Mes */}
            <div className="col-md-3">
              <label className="form-label">Mes</label>
              <select
                className="form-select bg-dark text-light border-secondary"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>
              <small className="text-muted">
                Si eliges mes pero no año, no se aplicará el filtro.
              </small>
            </div>

            {/* Botones */}
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-primary me-2"
                type="button"
                onClick={cargarHistorial}
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

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {cargando ? (
        <p className="text-muted">Cargando historial...</p>
      ) : !activoId ? (
        <p className="text-muted">
          Selecciona un activo para ver su historial.
        </p>
      ) : registros.length === 0 ? (
        <p className="text-muted">
          No hay registros de mantenimiento para el filtro actual.
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
                  <td>{formatFecha(r.fecha)}</td>
                  <td>{formatFecha(r.creado_en)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HistorialGlobal;
