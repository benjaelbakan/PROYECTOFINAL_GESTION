import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  return new Date(fecha).toISOString().slice(0, 10); // "aaaa-mm-dd"
};

function OrdenesTrabajo() {
  const navigate = useNavigate();

  const [ots, setOts] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState("");

  const cargarOTs = async (estado) => {
    try {
      setCargando(true);
      setError(null);

      const query = estado ? `?estado=${estado}` : "";
      const res = await fetch(`/api/ot${query}`);

      if (!res.ok) throw new Error("Error al cargar las órdenes de trabajo");

      const data = await res.json();

      // 🔥 Filtrar: NO mostrar finalizadas
      const activas = data.filter((ot) => ot.estado !== "finalizada");

      setOts(activas);
      
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

      setMensaje("Estado actualizado correctamente");

      setOts((prev) =>
        prev.map((ot) =>
          ot.id === id ? { ...ot, estado: nuevoEstado } : ot
        )
      );
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

  return (
    <div className="container mt-4">
      <h2>Órdenes de Trabajo</h2>

      {/* Filtro por estado */}
      <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
        <div></div>
        <div className="d-flex align-items-center">
          <span className="me-2">Filtrar por estado:</span>
          <select
            className="form-select form-select-sm bg-dark text-light"
            style={{ width: 180 }}
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="finalizada">Finalizada</option>
          </select>
        </div>
      </div>

      {mensaje && <div className="alert alert-success py-2 mt-2">{mensaje}</div>}
      {error && <div className="alert alert-danger py-2 mt-2">{error}</div>}

      {cargando ? (
        <p className="text-muted mt-3">Cargando órdenes de trabajo...</p>
      ) : ots.length === 0 ? (
        <p className="text-muted mt-3">No hay órdenes de trabajo registradas.</p>
      ) : (
        <div className="table-responsive mt-3">
          <table className="table table-dark table-hover table-sm align-middle">
            <thead>
              <tr>
                <th>ID OT</th>
                <th>Activo</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Fecha prog.</th>
                <th>Trabajador asignado</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ots.map((ot) => (
                <tr key={ot.id}>
                  <td>{ot.id}</td>
                  <td>{ot.activo_id}</td>
                  <td>{ot.tipo}</td>
                  <td>{ot.descripcion}</td>
                  <td>{formatearFecha(ot.fecha_programada)}</td>

                  {/* Trabajador asignado */}
                  <td>
                    <div className="d-flex">
                      <input
                        type="text"
                        className="form-control form-control-sm me-2 bg-dark text-light"
                        value={ot.trabajador_asignado || ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setOts((prev) =>
                            prev.map((x) =>
                              x.id === ot.id
                                ? { ...x, trabajador_asignado: v }
                                : x
                            )
                          );
                        }}
                        placeholder="Sin asignar"
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-light"
                        onClick={() =>
                          actualizarTrabajador(
                            ot.id,
                            ot.trabajador_asignado || ""
                          )
                        }
                      >
                        Guardar
                      </button>
                    </div>
                  </td>

                  {/* Estado */}
                  <td>
                    <select
                      className="form-select form-select-sm bg-dark text-light"
                      value={ot.estado}
                      onChange={(e) => cambiarEstado(ot.id, e.target.value)}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_progreso">En progreso</option>
                      <option value="finalizada">Finalizada</option>
                    </select>
                  </td>

                  {/* Acciones: Ver detalle */}
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-info"
                      onClick={() => navigate(`/ot/${ot.id}`)}
                    >
                      Ver detalle
                    </button>
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

export default OrdenesTrabajo;
