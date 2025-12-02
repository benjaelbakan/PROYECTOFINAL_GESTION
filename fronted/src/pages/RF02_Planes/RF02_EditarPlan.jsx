import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function EditarPlan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activoId, setActivoId] = useState("");
  const [tipo, setTipo] = useState("tiempo");
  const [fecha, setFecha] = useState("");
  const [km, setKm] = useState("");
  const [horas, setHoras] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    const cargarPlan = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/planes/${id}`);
        const plan = res.data;
        setActivoId(plan.activo_id);
        setTipo(plan.tipo);
        setFecha(plan.fecha || "");
        setKm(plan.km_programado || "");
        setHoras(plan.horas_programado || "");
        setDescripcion(plan.descripcion);
      } catch (error) {
        console.error("Error cargando plan:", error);
        alert("No se pudo cargar el plan");
      }
    };
    cargarPlan();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!activoId || !tipo || !descripcion) {
      alert("Completa todos los campos obligatorios");
      return;
    }
    if (tipo === "tiempo" && !fecha) {
      alert("Para planes por tiempo, ingresa la fecha programada");
      return;
    }
    if (tipo === "uso" && !km && !horas) {
      alert("Para planes por uso, ingresa Km o Horas programadas");
      return;
    }

    try {
      await axios.put(`http://localhost:3001/api/planes/${id}`, {
        activo_id: activoId,
        tipo,
        descripcion,
        fecha: tipo === "tiempo" ? fecha : null,
        km_programado: tipo === "uso" ? (km ? Number(km) : null) : null,
        horas_programado: tipo === "uso" ? (horas ? Number(horas) : null) : null,
      });

      alert("Plan actualizado correctamente");
      navigate("/planes");
    } catch (error) {
      console.error("Error al actualizar plan:", error);
      alert("Error al actualizar plan");
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="text-white mb-4">✏️ Editar Plan de Mantenimiento</h3>
      <form onSubmit={handleSubmit} className="bg-dark p-4 rounded text-white">
        {/* mismo formulario que CrearPlan */}
        {/* ... puedes reutilizar el mismo JSX de CrearPlan con valores de estado */}
        <div className="mb-3">
          <label>Activo ID</label>
          <input
            type="number"
            className="form-control"
            value={activoId}
            onChange={(e) => setActivoId(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Tipo</label>
          <select
            className="form-select"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="tiempo">Tiempo</option>
            <option value="uso">Uso</option>
          </select>
        </div>

        {tipo === "tiempo" && (
          <div className="mb-3">
            <label>Fecha programada</label>
            <input
              type="date"
              className="form-control"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
        )}

        {tipo === "uso" && (
          <>
            <div className="mb-3">
              <label>Kilometraje programado</label>
              <input
                type="number"
                className="form-control"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                placeholder="Opcional si se usarán horas"
              />
            </div>
            <div className="mb-3">
              <label>Horas programadas</label>
              <input
                type="number"
                className="form-control"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
                placeholder="Opcional si se usará km"
              />
            </div>
          </>
        )}

        <div className="mb-3">
          <label>Descripción</label>
          <textarea
            className="form-control"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-success fw-bold">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}

export default EditarPlan;
