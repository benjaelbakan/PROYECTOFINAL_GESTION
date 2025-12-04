import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CrearPlan() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    activo_id: "",
    ot_id: "",
    tipo: "Preventivo",
    descripcion: "",
    fecha: "",
    km_programado: "",
    horas_programado: "",
  });

  const [activos, setActivos] = useState([]);
  const [ots, setOts] = useState([]);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [resActivos, resOts] = await Promise.all([
                axios.get("http://localhost:3001/api/activos"),
                axios.get("http://localhost:3001/api/ordenes/orden_trabajo") // Ajusta la ruta si es necesario
            ]);
            setActivos(resActivos.data);
            setOts(resOts.data);
        } catch (err) {
            console.error("Error cargando datos:", err);
        }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);

    if (!form.activo_id || !form.tipo || !form.descripcion) {
      setMensaje({ type: 'danger', text: "Por favor completa todos los campos obligatorios."});
      return;
    }

    try {
      await axios.post("http://localhost:3001/api/planes", {
        activo_id: parseInt(form.activo_id),
        ot_id: form.ot_id ? parseInt(form.ot_id) : null,
        tipo: form.tipo,
        descripcion: form.descripcion,
        fecha: form.fecha || null,
        km_programado: form.km_programado ? parseInt(form.km_programado) : null,
        horas_programado: form.horas_programado ? parseInt(form.horas_programado) : null,
      });

      setMensaje({ type: 'success', text: "Plan de mantenimiento creado correctamente"});
      setTimeout(() => navigate("/planes"), 1500); // Redirigir tras éxito
    } catch (err) {
      console.error("Error al crear plan:", err);
      setMensaje({ type: 'danger', text: "Error al crear el plan en el servidor."});
    }
  };

  // Clases CSS
  const inputClass = "form-control bg-dark text-white border-secondary focus-ring focus-ring-success";
  const selectClass = "form-select bg-dark text-white border-secondary";
  const labelClass = "form-label text-white-50 fw-semibold small";

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
            
            {/* BOTÓN VOLVER */}
            <div className="mb-3">
                <button 
                    className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 text-white-50 hover-white"
                    onClick={() => navigate('/planes')}
                >
                    <i className="bi bi-arrow-left"></i>
                    Volver a Planes
                </button>
            </div>

            <div className="card bg-dark border border-secondary shadow-lg rounded-4">
                <div className="card-header bg-transparent border-bottom border-secondary p-4">
                    <h4 className="text-white mb-0 d-flex align-items-center gap-2">
                        <i className="bi bi-journal-plus text-success"></i>
                        Nuevo Plan de Mantenimiento
                    </h4>
                </div>

                <div className="card-body p-4">
                    {mensaje && (
                        <div className={`alert alert-${mensaje.type} d-flex align-items-center`}>
                            <i className="bi bi-info-circle-fill me-2"></i>
                            {mensaje.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            {/* Fila 1 */}
                            <div className="col-md-6">
                                <label className={labelClass}>Activo (Obligatorio)</label>
                                <select name="activo_id" className={selectClass} value={form.activo_id} onChange={handleChange} required>
                                    <option value="">Seleccione un activo...</option>
                                    {activos.map((a) => (
                                        <option key={a.id} value={a.id}>{a.codigo} - {a.marca} {a.modelo}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className={labelClass}>Tipo de Plan</label>
                                <select name="tipo" className={selectClass} value={form.tipo} onChange={handleChange}>
                                    <option value="Preventivo">Preventivo</option>
                                    <option value="Correctivo">Correctivo</option>
                                </select>
                            </div>

                            {/* Fila 2 */}
                            <div className="col-12">
                                <label className={labelClass}>OT Relacionada (Opcional)</label>
                                <select name="ot_id" className={selectClass} value={form.ot_id} onChange={handleChange}>
                                    <option value="">Ninguna / Nueva OT</option>
                                    {ots.map((ot) => (
                                        <option key={ot.id} value={ot.id}>OT-{ot.id}: {ot.descripcion}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Fila 3 */}
                            <div className="col-12">
                                <label className={labelClass}>Descripción del Plan</label>
                                <textarea
                                    className={inputClass}
                                    name="descripcion"
                                    rows="2"
                                    value={form.descripcion}
                                    onChange={handleChange}
                                    placeholder="Ej: Cambio de aceite y filtros cada 5000 km..."
                                    required
                                ></textarea>
                            </div>

                            <hr className="border-secondary opacity-25 my-4" />
                            <h6 className="text-secondary text-uppercase small ls-1 mb-3">Criterios de Ejecución (Opcionales)</h6>

                            {/* Fila 4: Criterios */}
                            <div className="col-md-4">
                                <label className={labelClass}>Fecha Límite</label>
                                <input type="date" name="fecha" className={inputClass} value={form.fecha} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className={labelClass}>Km Programado</label>
                                <div className="input-group">
                                    <input type="number" name="km_programado" className={inputClass} value={form.km_programado} onChange={handleChange} placeholder="0" />
                                    <span className="input-group-text bg-dark border-secondary text-secondary">km</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className={labelClass}>Horas Programadas</label>
                                <div className="input-group">
                                    <input type="number" name="horas_programado" className={inputClass} value={form.horas_programado} onChange={handleChange} placeholder="0" />
                                    <span className="input-group-text bg-dark border-secondary text-secondary">hrs</span>
                                </div>
                            </div>

                            <div className="col-12 mt-4">
                                <button type="submit" className="btn btn-success btn-lg w-100 shadow-sm">
                                    <i className="bi bi-save me-2"></i>
                                    Crear Plan
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default CrearPlan;