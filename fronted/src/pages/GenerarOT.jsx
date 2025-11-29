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
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  // Cargar activos al entrar
  useEffect(() => {
    const cargarActivos = async () => {
      try {
        setCargandoActivos(true);
        setErrorActivos(null);

        const res = await fetch("/api/activos");
        if (!res.ok) throw new Error("No se pudieron cargar los activos");

        const data = await res.json();
        setActivos(data);

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

    setLoadingSubmit(true);

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
      setMensaje(`✅ Orden de Trabajo #${data.id} generada con éxito.`);
      
      // Limpiar campos
      setDescripcion("");
      setTrabajadorAsignado("");
      
      // Scroll arriba
      window.scrollTo(0, 0);

    } catch (err) {
      console.error("Error creando OT:", err);
      setErrorForm(err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-9">
          
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0 text-white">Generar Orden de Trabajo</h2>
            <button
              type="button"
              className="btn btn-outline-info"
              onClick={() => navigate("/ot")}
            >
              Ver Listado de OT
            </button>
          </div>

          {/* Mensajes de Alerta */}
          {mensaje && <div className="alert alert-success border-success d-flex align-items-center">{mensaje}</div>}
          {errorForm && <div className="alert alert-danger border-danger">{errorForm}</div>}

          <div className="card bg-dark border-secondary shadow">
            <div className="card-header border-secondary bg-transparent py-3">
              <h5 className="mb-0 text-white-50">Nueva Solicitud de Mantenimiento</h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                
                {/* SECCIÓN 1: EL ACTIVO */}
                <div className="mb-4">
                  <label className="form-label text-warning small text-uppercase fw-bold">1. Seleccionar Activo <span className="text-danger">*</span></label>
                  {cargandoActivos ? (
                    <div className="text-muted fst-italic">Cargando lista de activos...</div>
                  ) : errorActivos ? (
                    <div className="text-danger small">{errorActivos}</div>
                  ) : activos.length === 0 ? (
                    <div className="alert alert-warning">No hay activos registrados. Crea uno primero.</div>
                  ) : (
                    <select
                      className="form-select form-select-lg bg-dark text-white border-secondary"
                      value={activoId}
                      onChange={(e) => setActivoId(e.target.value)}
                    >
                      {activos.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.codigo} — {a.marca} {a.modelo} ({a.tipo === 'VEHICULO' ? 'Vehículo' : 'Maquinaria'})
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="form-text text-white-50">Selecciona el vehículo o maquinaria que requiere servicio.</div>
                </div>

                <hr className="border-secondary my-4 opacity-50" />

                {/* SECCIÓN 2: DETALLES DE LA OT */}
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label text-info small text-uppercase fw-bold">2. Detalles del Servicio</label>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-white">Tipo de Mantenimiento <span className="text-danger">*</span></label>
                    <select
                      className="form-select bg-dark text-white border-secondary"
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                    >
                      <option value="preventiva">🛡️ Preventiva</option>
                      <option value="correctiva">🔧 Correctiva (Reparación)</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-white">Fecha Programada</label>
                    <input
                      type="date"
                      className="form-control bg-dark text-white border-secondary"
                      value={fechaProgramada}
                      onChange={(e) => setFechaProgramada(e.target.value)}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label text-white">Descripción del Trabajo <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control bg-dark text-white border-secondary"
                      rows="4"
                      placeholder="Describe detalladamente qué se debe realizar. Ej: Cambio de filtros de aceite y aire, revisión de frenos traseros..."
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label text-white">Trabajador Asignado (Opcional)</label>
                    <div className="input-group">
                      <span className="input-group-text bg-secondary border-secondary text-white">👤</span>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="Nombre del técnico o mecánico responsable"
                        value={trabajadorAsignado}
                        onChange={(e) => setTrabajadorAsignado(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 d-flex justify-content-end gap-2">
                  <button 
                    type="button" 
                    className="btn btn-outline-light"
                    onClick={() => navigate("/")}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success px-4 fw-bold"
                    disabled={cargandoActivos || activos.length === 0 || loadingSubmit}
                  >
                    {loadingSubmit ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Generando...
                      </>
                    ) : (
                      "Generar Orden de Trabajo"
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerarOT;