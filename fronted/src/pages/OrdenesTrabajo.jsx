import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// --- ICONOS SVG ---
const IconSave = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M11 2H9v3h2z"/>
    <path d="M1.5 0h11.586a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 14.5v-13A1.5 1.5 0 0 1 1.5 0M1 1.5v13a.5.5 0 0 0 .5.5H2v-4.5A1.5 1.5 0 0 1 3.5 9h9a1.5 1.5 0 0 1 1.5 1.5V15h.5a.5.5 0 0 0 .5-.5V2.914a.5.5 0 0 0-.146-.353l-1.415-1.415A.5.5 0 0 0 13.086 1H13v4.5A1.5 1.5 0 0 1 11.5 7h-7A1.5 1.5 0 0 1 3 5.5V1H1.5a.5.5 0 0 0-.5.5m3 4a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5V1H4zM3 15h10v-4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5z"/>
  </svg>
);

const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
  </svg>
);

const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  // Formato más amigable: 12/12/2023
  return new Date(fecha).toLocaleDateString("es-CL", { timeZone: 'UTC' });
};

function OrdenesTrabajo() {
  const navigate = useNavigate();

  const [ots, setOts] = useState([]);
  const [activos, setActivos] = useState([]); // Cargamos activos para saber los nombres
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState("");

  // Cargar Activos (para mostrar nombres en vez de ID)
  useEffect(() => {
    fetch("/api/activos")
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setActivos(data);
      })
      .catch(err => console.error("Error cargando activos para mapeo:", err));
  }, []);

  const cargarOTs = async (estado) => {
    try {
      setCargando(true);
      setError(null);

      const query = estado ? `?estado=${estado}` : "";
      const res = await fetch(`/api/ot${query}`);

      if (!res.ok) throw new Error("Error al cargar las órdenes de trabajo");

      const data = await res.json();

      // Filtramos finalizadas para que no ensucien la lista principal (opcional, como lo tenías)
      const soloNoFinalizadas = data.filter((ot) => ot.estado !== "finalizada");

      setOts(soloNoFinalizadas);
    } catch (err) {
      console.error("Error cargando OT:", err);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarOTs(estadoFiltro);
  }, [estadoFiltro]);

  // Helper para obtener nombre del activo
  const getNombreActivo = (id) => {
    const activo = activos.find(a => a.id === id);
    if (!activo) return `ID: ${id}`;
    // Si es vehículo mostramos patente, si no, mostramos código/serie
    const identificador = activo.tipo === "VEHICULO" ? activo.codigo : (activo.codigo || "Maquinaria");
    return `${identificador} - ${activo.marca} ${activo.modelo}`; 
  };

  // KPIs
  const stats = useMemo(() => {
    const pendientes = ots.filter(o => o.estado === "pendiente").length;
    const progreso = ots.filter(o => o.estado === "en_progreso").length;
    return { pendientes, progreso };
  }, [ots]);

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      setMensaje(null);
      setError(null);

      const res = await fetch(`/api/ot/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) {
        const dataError = await res.json().catch(() => ({}));
        throw new Error(dataError.message || "Error al actualizar estado");
      }

      if (nuevoEstado === "finalizada") {
        setMensaje("✅ OT finalizada y movida al historial.");
        setOts((prev) => prev.filter((ot) => ot.id !== id));
      } else {
        setMensaje("Estado actualizado correctamente");
        setOts((prev) =>
          prev.map((ot) =>
            ot.id === id ? { ...ot, estado: nuevoEstado } : ot
          )
        );
      }
    } catch (err) {
      console.error("Error cambiando estado OT:", err);
      setError(err.message);
    }
  };

  const actualizarTrabajador = async (id, nuevoTrabajador) => {
    try {
      setMensaje(null);
      setError(null);

      const res = await fetch(`/api/ot/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trabajadorAsignado: nuevoTrabajador }),
      });

      if (!res.ok) {
        const dataError = await res.json().catch(() => ({}));
        throw new Error(
          dataError.message || "Error al actualizar trabajador asignado"
        );
      }

      setMensaje("Trabajador actualizado correctamente");
    } catch (err) {
      console.error("Error actualizando trabajador:", err);
      setError(err.message);
    }
  };

  // Estilos de estado para el SELECT (mejor contraste)
  const getEstadoClass = (estado) => {
    switch (estado) {
      case "pendiente": return "bg-dark text-danger border-danger fw-bold";
      case "en_progreso": return "bg-dark text-warning border-warning fw-bold";
      case "finalizada": return "bg-dark text-success border-success fw-bold";
      default: return "bg-dark text-light border-secondary";
    }
  };

  return (
    <div className="container mt-4">
      
      {/* KPIs DE RESUMEN - DISEÑO LIMPIO Y LEGIBLE */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card bg-dark shadow-sm border-0 h-100 position-relative overflow-hidden">
            {/* Barra lateral de color */}
            <div className="position-absolute top-0 start-0 bottom-0 bg-danger" style={{width: '6px'}}></div>
            <div className="card-body ps-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-white-50 mb-1 text-uppercase fw-bold small">Pendientes</h6>
                <h2 className="mb-0 fw-bold text-white">{stats.pendientes}</h2>
              </div>
              <div className="text-danger fs-2 opacity-75">⏳</div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card bg-dark shadow-sm border-0 h-100 position-relative overflow-hidden">
            {/* Barra lateral de color */}
            <div className="position-absolute top-0 start-0 bottom-0 bg-warning" style={{width: '6px'}}></div>
            <div className="card-body ps-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="text-white-50 mb-1 text-uppercase fw-bold small">En Progreso</h6>
                <h2 className="mb-0 fw-bold text-white">{stats.progreso}</h2>
              </div>
              <div className="text-warning fs-2 opacity-75">🔧</div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-end mb-3">
        <h3 className="mb-0 text-white">Gestión de Órdenes de Trabajo</h3>
        
        <div className="d-flex align-items-center gap-2">
          <label className="text-white-50 small me-2">Filtrar:</label>
          <select
            className="form-select form-select-sm bg-dark text-white border-secondary"
            style={{ width: 180 }}
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option value="">⚡ Todas Activas</option>
            <option value="pendiente">Pendientes</option>
            <option value="en_progreso">En progreso</option>
          </select>
        </div>
      </div>

      {mensaje && <div className="alert alert-success py-2 mb-3 small fw-semibold">{mensaje}</div>}
      {error && <div className="alert alert-danger py-2 mb-3 small fw-semibold">{error}</div>}

      <div className="card bg-dark border-secondary shadow-sm">
        <div className="card-body p-0">
          {cargando ? (
            <p className="text-white-50 text-center py-5 m-0">Cargando órdenes de trabajo...</p>
          ) : ots.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-white-50 mb-3">No hay órdenes de trabajo pendientes.</p>
              <button className="btn btn-success btn-sm" onClick={() => navigate("/ot/nueva")}>+ Generar Nueva OT</button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead className="table-secondary text-dark text-uppercase small">
                  <tr>
                    <th className="ps-3 border-0">ID</th>
                    <th className="border-0">Activo / Vehículo</th>
                    <th className="border-0">Tipo</th>
                    <th className="border-0">Descripción</th>
                    <th className="border-0">Fecha</th>
                    <th style={{minWidth: '200px'}} className="border-0">Técnico Asignado</th>
                    <th style={{minWidth: '160px'}} className="border-0">Estado</th>
                    <th className="text-end pe-3 border-0">Acción</th>
                  </tr>
                </thead>
                <tbody className="border-top border-secondary">
                  {ots.map((ot) => (
                    <tr key={ot.id}>
                      <td className="ps-3 fw-bold text-white">#{ot.id}</td>
                      <td>
                        <span className="fw-bold text-white d-block">
                          {getNombreActivo(ot.activo_id).split(" - ")[0]}
                        </span>
                        <small className="text-white-50">
                          {getNombreActivo(ot.activo_id).split(" - ")[1]}
                        </small>
                      </td>
                      <td>
                        <span className={`badge ${ot.tipo === 'correctiva' ? 'bg-danger bg-opacity-75' : 'bg-info bg-opacity-75 text-dark'}`}>
                          {ot.tipo}
                        </span>
                      </td>
                      <td className="text-white-50 small" style={{maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {ot.descripcion}
                      </td>
                      <td className="small text-white">{formatearFecha(ot.fecha_programada)}</td>

                      {/* Trabajador asignado */}
                      <td>
                        <div className="input-group input-group-sm">
                          <input
                            type="text"
                            className="form-control bg-dark text-white border-secondary"
                            value={ot.trabajador_asignado || ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              setOts((prev) =>
                                prev.map((x) => x.id === ot.id ? { ...x, trabajador_asignado: v } : x)
                              );
                            }}
                            placeholder="Asignar..."
                          />
                          <button
                            className="btn btn-outline-secondary text-white-50"
                            title="Guardar asignación"
                            onClick={() => actualizarTrabajador(ot.id, ot.trabajador_asignado || "")}
                          >
                            <IconSave />
                          </button>
                        </div>
                      </td>

                      {/* Estado */}
                      <td>
                        <select
                          className={`form-select form-select-sm ${getEstadoClass(ot.estado)}`}
                          value={ot.estado}
                          onChange={(e) => cambiarEstado(ot.id, e.target.value)}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en_progreso">En progreso</option>
                          <option value="finalizada">✅ Finalizar</option>
                        </select>
                      </td>

                      {/* Acciones */}
                      <td className="text-end pe-3">
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-info p-0"
                          title="Ver Detalle Completo"
                          onClick={() => navigate(`/ot/${ot.id}`)}
                        >
                          <IconEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrdenesTrabajo;