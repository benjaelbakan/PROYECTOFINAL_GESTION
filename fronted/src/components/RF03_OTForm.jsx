import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerOT, crearOT, actualizarOT } from "../services/RF03_OT.service.js";
import axios from 'axios'; // Necesario para cargar la lista de activos

export default function OTForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ot, setOt] = useState({
    activo_id: "",
    tipo: "",
    descripcion: "",
    fecha_programada: "",
    trabajador_asignado: "",
    estado: "pendiente",
    costo: "",
  });
  
  const [activos, setActivos] = useState([]); // Lista para el dropdown
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
        setLoading(true);
        try {
            // 1. Cargar lista de Activos para el selector
            const resActivos = await axios.get("http://localhost:3001/api/activos");
            setActivos(resActivos.data);

            // 2. Si hay ID (Edición), cargar la OT
            if (id) {
                const otData = await obtenerOT(id);
                // Ajuste de datos si viene en array o formato fecha
                const data = Array.isArray(otData) ? otData[0] : otData;
                if (data.fecha_programada) {
                    data.fecha_programada = data.fecha_programada.split("T")[0];
                }
                setOt(data);
            }
        } catch (err) {
            console.error("Error cargando datos:", err);
        } finally {
            setLoading(false);
        }
    };
    cargarDatos();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOt({ ...ot, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...ot, costo: Number(ot.costo) };
      if (id) {
        await actualizarOT(id, dataToSend);
      } else {
        await crearOT(dataToSend);
      }
      navigate("/ordenes_trabajo");
    } catch (err) {
      console.error("Error al guardar OT:", err);
      alert("Hubo un error al guardar la orden de trabajo.");
    }
  };

  if (loading) return (
    <div className="text-center py-4 text-white-50">
        <div className="spinner-border spinner-border-sm text-warning me-2" role="status"></div>
        Cargando formulario...
    </div>
  );

  // Clases de estilo reutilizables
  const labelClass = "form-label text-white-50 fw-semibold small";
  const inputClass = "form-control bg-dark text-white border-secondary focus-ring focus-ring-warning";
  const selectClass = "form-select bg-dark text-white border-secondary focus-ring focus-ring-warning";

  return (
    <form onSubmit={handleSubmit} className="p-2">
      <div className="row g-3">
        
        {/* --- ACTIVO RELACIONADO (Ahora es un Select) --- */}
        <div className="col-md-6">
            <label className={labelClass}>Activo Relacionado</label>
            <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-truck"></i>
                </span>
                <select
                    name="activo_id"
                    value={ot.activo_id}
                    onChange={handleChange}
                    className={selectClass}
                    required
                >
                    <option value="">Seleccione un activo...</option>
                    {activos.map((activo) => (
                        <option key={activo.id} value={activo.id}>
                            {activo.codigo} - {activo.marca} {activo.modelo}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-text text-secondary small">
                Seleccione el equipo o vehículo al que se realizará el servicio.
            </div>
        </div>

        {/* --- TIPO DE MANTENIMIENTO (Solo Preventivo/Correctivo) --- */}
        <div className="col-md-6">
            <label className={labelClass}>Tipo de Mantenimiento</label>
            <select
                name="tipo"
                value={ot.tipo}
                onChange={handleChange}
                className={selectClass}
                required
            >
                <option value="">Seleccione tipo...</option>
                <option value="Preventivo">Preventivo</option>
                <option value="Correctivo">Correctivo</option>
            </select>
        </div>

        {/* --- DESCRIPCIÓN --- */}
        <div className="col-12">
            <label className={labelClass}>Descripción del Trabajo</label>
            <textarea
                name="descripcion"
                value={ot.descripcion}
                onChange={handleChange}
                placeholder="Detalle brevemente el trabajo a realizar..."
                className={inputClass}
                rows="2"
                required
            />
        </div>

        {/* --- FECHA Y ASIGNACIÓN --- */}
        <div className="col-md-6">
            <label className={labelClass}>Fecha Programada</label>
            <input
                name="fecha_programada"
                type="date"
                value={ot.fecha_programada || ""}
                onChange={handleChange}
                className={inputClass}
                required
            />
        </div>

        <div className="col-md-6">
            <label className={labelClass}>Trabajador Asignado</label>
            <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                    <i className="bi bi-person"></i>
                </span>
                <input
                    name="trabajador_asignado"
                    value={ot.trabajador_asignado}
                    onChange={handleChange}
                    placeholder="Nombre del técnico"
                    className={inputClass}
                />
            </div>
        </div>

        {/* --- ESTADO Y COSTO --- */}
        <div className="col-md-6">
            <label className={labelClass}>Estado Actual</label>
            <select
                name="estado"
                value={ot.estado}
                onChange={handleChange}
                className={selectClass}
            >
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completado</option>
                <option value="retrasado">Retrasado</option>
            </select>
        </div>

        <div className="col-md-6">
            <label className={labelClass}>Costo Estimado ($)</label>
            <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-secondary">$</span>
                <input
                    name="costo"
                    type="number"
                    step="0.01"
                    value={ot.costo}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={inputClass}
                />
            </div>
        </div>

        {/* --- BOTONES --- */}
        <div className="col-12 mt-4 d-flex justify-content-end gap-2">
            <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/ordenes_trabajo')}
            >
                Cancelar
            </button>
            <button type="submit" className="btn btn-primary px-4 d-flex align-items-center gap-2">
                <i className="bi bi-save"></i>
                {id ? "Actualizar Orden" : "Crear Orden"}
            </button>
        </div>

      </div>
    </form>
  );
}