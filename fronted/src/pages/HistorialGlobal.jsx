import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MESES = [
  { value: "1", label: "Enero" }, { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" }, { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" }, { value: "6", label: "Junio" },
  { value: "7", label: "Julio" }, { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" }, { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" }, { value: "12", label: "Diciembre" },
];

function HistorialGlobal() {
  const navigate = useNavigate();

  // Estados
  const [activos, setActivos] = useState([]);
  const [activoId, setActivoId] = useState(""); // Vacio = Todos

  const [anio, setAnio] = useState("");
  const [mes, setMes] = useState("");
  const [tipo, setTipo] = useState("");

  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Años disponibles (Dinámico: año actual hacia atrás/adelante)
  const currentYear = new Date().getFullYear();
  const aniosDisponibles = Array.from({ length: 8 }, (_, i) => currentYear - 3 + i);

  // 1. Cargar lista de activos para el filtro
  useEffect(() => {
    fetch("/api/activos")
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener activos");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setActivos(data);
        } else {
          console.error("La API de activos no devolvió una lista válida:", data);
          setActivos([]);
        }
      })
      .catch((err) => console.error("Error cargando activos", err));
  }, []);

  // 2. Función principal de carga
  const cargarHistorial = async () => {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (anio) params.append("anio", anio);
      if (mes) params.append("mes", mes);
      if (tipo && tipo !== "todos") params.append("tipo", tipo);

      let url;
      if (activoId) {
        // Si hay activo seleccionado, usamos la ruta específica
        url = `/api/activos/${activoId}/historial?${params.toString()}`;
      } else {
        // Si NO hay activo, usamos la ruta GLOBAL
        url = `/api/historial?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al cargar datos");
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setRegistros(data);
      } else {
        setRegistros([]);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el historial.");
    } finally {
      setCargando(false);
    }
  };

  // 3. Recargar automáticamente cuando cambian los filtros
  useEffect(() => {
    cargarHistorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activoId, anio, mes, tipo]); 

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Historial Global de Mantenimiento</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </div>

      {/* Panel de Filtros */}
      <div className="card bg-dark text-white border-secondary mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label text-muted small">Filtrar por Vehículo</label>
              <select 
                className="form-select bg-secondary text-white border-0"
                value={activoId} 
                onChange={(e) => setActivoId(e.target.value)}
              >
                <option value="">-- Ver Todos los Vehículos --</option>
                {activos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.codigo} - {a.marca} {a.modelo}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label text-muted small">Año</label>
              <select className="form-select bg-secondary text-white border-0" value={anio} onChange={(e) => setAnio(e.target.value)}>
                <option value="">Todos</option>
                {aniosDisponibles.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label text-muted small">Mes</label>
              <select className="form-select bg-secondary text-white border-0" value={mes} onChange={(e) => setMes(e.target.value)}>
                <option value="">Todos</option>
                {MESES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label text-muted small">Tipo</label>
              <select className="form-select bg-secondary text-white border-0" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="">Todos</option>
                <option value="preventiva">Preventiva</option>
                <option value="correctiva">Correctiva</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Resultados */}
      {error && <div className="alert alert-danger">{error}</div>}

      {cargando && <div className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></div>}
      
      {!cargando && !error && registros.length === 0 && (
        <div className="alert alert-info text-center">No se encontraron registros con estos filtros.</div>
      )}

      {!cargando && !error && registros.length > 0 && (
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle">
            <thead className="table-light text-dark">
              <tr>
                <th>Fecha</th>
                <th>Vehículo</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>OT ID</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id}>
                  <td>
                    {new Date(r.fecha).toLocaleDateString("es-CL", { timeZone: 'UTC' })}
                  </td>
                  <td>
                    {/* Si viene del endpoint global tiene marca/modelo, si no, mostramos ID */}
                    {r.marca ? (
                      <span className="badge bg-secondary">{r.codigo}</span>
                    ) : (
                      <span className="badge bg-secondary">Activo #{r.activo_id}</span>
                    )}
                    {r.marca && <small className="d-block text-muted">{r.marca} {r.modelo}</small>}
                  </td>
                  <td>
                    <span className={`badge ${r.tipo === 'correctiva' ? 'bg-danger' : 'bg-success'}`}>
                      {r.tipo}
                    </span>
                  </td>
                  <td>{r.descripcion}</td>
                  <td className="text-muted small">#{r.ot_id}</td>
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