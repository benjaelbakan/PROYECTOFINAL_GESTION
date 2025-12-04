import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function EditarPlan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    activo_id: "",
    tipo: "Preventivo", // Valor por defecto seguro
    fecha: "",
    km_programado: "",
    horas_programado: "",
    descripcion: "",
  });

  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    const cargarPlan = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/planes/${id}`);
        const plan = res.data;
        
        // Ajuste de fecha para input type="date"
        let fechaFmt = "";
        if(plan.fecha) {
            fechaFmt = plan.fecha.split('T')[0];
        }

        setForm({
            activo_id: plan.activo_id,
            tipo: plan.tipo || "Preventivo",
            descripcion: plan.descripcion,
            fecha: fechaFmt,
            km_programado: plan.km_programado || "",
            horas_programado: plan.horas_programado || ""
        });
      } catch (error) {
        console.error("Error cargando plan:", error);
        setMensaje({type: 'danger', text: "No se pudo cargar la información del plan."});
      }
    };
    cargarPlan();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);

    // Validación básica de campos requeridos
    if (!form.activo_id || !form.descripcion) {
      setMensaje({type: 'warning', text: "El ID de Activo y la Descripción son obligatorios."});
      return;
    }

    try {
      await axios.put(`http://localhost:3001/api/planes/${id}`, {
        activo_id: form.activo_id,
        tipo: form.tipo,
        descripcion: form.descripcion,
        fecha: form.fecha || null,
        km_programado: form.km_programado ? Number(form.km_programado) : null,
        horas_programado: form.horas_programado ? Number(form.horas_programado) : null,
      });

      setMensaje({type: 'success', text: "Plan actualizado correctamente."});
      setTimeout(() => navigate("/planes"), 1500);
    } catch (error) {
      console.error("Error al actualizar plan:", error);
      setMensaje({type: 'danger', text: "Error al actualizar el plan."});
    }
  };

  // Estilos
  const inputClass = "form-control bg-dark text-white border-secondary focus-ring focus-ring-warning";
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
                    Cancelar y Volver
                </button>
            </div>

            <div className="card bg-dark border border-secondary shadow-lg rounded-4">
                <div className="card-header bg-transparent border-bottom border-secondary p-4">
                    <h4 className="text-white mb-0 d-flex align-items-center gap-2">
                        <i className="bi bi-pencil-square text-warning"></i>
                        Editar Plan #{id}
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
                            {/* Campos Principales */}
                            <div className="col-md-4">
                                <label className={labelClass}>ID Activo</label>
                                <input type="number" name="activo_id" className={inputClass} value={form.activo_id} onChange={handleChange} required />
                                <div className="form-text text-secondary small">ID numérico del activo</div>
                            </div>
                            
                            <div className="col-md-8">
                                <label className={labelClass}>Tipo de Mantenimiento</label>
                                <select name="tipo" className={selectClass} value={form.tipo} onChange={handleChange}>
                                    <option value="Preventivo">Preventivo</option>
                                    <option value="Correctivo">Correctivo</option>
                                </select>
                            </div>

                            <div className="col-12">
                                <label className={labelClass}>Descripción</label>
                                <textarea name="descripcion" className={inputClass} rows="2" value={form.descripcion} onChange={handleChange} required />
                            </div>

                            <hr className="border-secondary opacity-25 my-4" />
                            <h6 className="text-secondary text-uppercase small ls-1 mb-3">Condiciones de Activación</h6>

                            {/* Campos Condicionales */}
                            <div className="col-md-4">
                                <label className={labelClass}>Fecha Programada</label>
                                <input type="date" name="fecha" className={inputClass} value={form.fecha} onChange={handleChange} />
                            </div>

                            <div className="col-md-4">
                                <label className={labelClass}>Km Límite</label>
                                <div className="input-group">
                                    <input type="number" name="km_programado" className={inputClass} value={form.km_programado} onChange={handleChange} placeholder="Opcional" />
                                    <span className="input-group-text bg-dark border-secondary text-secondary">km</span>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <label className={labelClass}>Horas Límite</label>
                                <div className="input-group">
                                    <input type="number" name="horas_programado" className={inputClass} value={form.horas_programado} onChange={handleChange} placeholder="Opcional" />
                                    <span className="input-group-text bg-dark border-secondary text-secondary">hrs</span>
                                </div>
                            </div>

                            <div className="d-grid gap-2 mt-4 d-md-flex justify-content-md-end">
                                <button type="button" className="btn btn-outline-light" onClick={() => navigate('/planes')}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-warning fw-bold px-4">
                                    <i className="bi bi-save me-2"></i>
                                    Guardar Cambios
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

export default EditarPlan;