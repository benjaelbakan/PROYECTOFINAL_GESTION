import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CrearPlan() {
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
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    cargarActivos();
    cargarOts();
  }, []);

  const cargarActivos = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/activos");
      setActivos(res.data);
    } catch (err) {
      console.error("Error cargando activos", err);
    }
  };

  const cargarOts = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/ordenes/orden_trabajo");
      setOts(res.data);
    } catch (err) {
      console.error("Error cargando OTs", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    // Validación simple
    if (!form.activo_id || !form.tipo || !form.descripcion) {
      setMensaje("Por favor completa todos los campos obligatorios.");
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

      setMensaje("Plan de mantenimiento creado correctamente");

      // Reset formulario
      setForm({
        activo_id: "",
        ot_id: "",
        tipo: "Preventivo",
        descripcion: "",
        fecha: "",
        km_programado: "",
        horas_programado: "",
      });

      navigate("/planes"); // Redirige a lista de planes
    } catch (err) {
      console.error("Error al crear plan:", err);
      setMensaje("Error al crear plan");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-white mb-4">Crear Plan de Mantenimiento</h2>

      {mensaje && (
        <div className={`alert ${mensaje.startsWith("Error") ? "alert-danger" : "alert-success"}`}>
          {mensaje}
        </div>
      )}

      <form className="card p-3 bg-dark text-white" onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-4">
            <label>Activo</label>
            <select name="activo_id" value={form.activo_id} onChange={handleChange} required>
              <option value="">Seleccione un activo</option>
              {activos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.codigo} - {a.marca} {a.modelo}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label>OT relacionada</label>
            <select name="ot_id" value={form.ot_id} onChange={handleChange}>
              <option value="">Seleccione una OT (opcional)</option>
              {ots.map((ot) => (
                <option key={ot.id} value={ot.id}>
                  OT-{ot.id} - {ot.descripcion}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label>Tipo</label>
            <select name="tipo" value={form.tipo} onChange={handleChange}>
              <option value="Preventivo">Preventivo</option>
              <option value="Correctivo">Correctivo</option>
            </select>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label>Descripción</label>
            <input
              type="text"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Ej: Cambio de aceite y revisión general"
              required
            />
          </div>

          <div className="col-md-6">
            <label>Fecha (opcional)</label>
            <input
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label>Km programado (opcional)</label>
            <input
              type="number"
              name="km_programado"
              value={form.km_programado}
              onChange={handleChange}
              placeholder="Ej: 10000"
            />
          </div>

          <div className="col-md-6">
            <label>Horas programadas (opcional)</label>
            <input
              type="number"
              name="horas_programado"
              value={form.horas_programado}
              onChange={handleChange}
              placeholder="Ej: 200"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-success w-100">
          Guardar Plan
        </button>
      </form>
    </div>
  );
}

export default CrearPlan;
