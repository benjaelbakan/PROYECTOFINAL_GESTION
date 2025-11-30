import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerOT, crearOT, actualizarOT } from "../services/RF03_OT.service.js";

export default function OTForm() {
  const { id } = useParams(); // Captura el ID de la URL (si es edición)
  const navigate = useNavigate();

  const [ot, setOt] = useState({
    activo_id: "",
    tipo: "",
    descripcion: "",
    fecha_programada: "",
    trabajador_asignado: "",
    estado: "",
    costo: "",
  });

  // Cargar datos si es edición
  useEffect(() => {
    if (id) {
      obtenerOT(id)
        .then((data) => {
          // Asegurarse de que sea un objeto
          const otData = Array.isArray(data) ? data[0] : data;
          // Formatear fecha para input type="date"
          if (otData.fecha_programada) {
            otData.fecha_programada = otData.fecha_programada.split("T")[0];
          }
          setOt(otData);
        })
        .catch((err) => console.error("Error al cargar OT:", err));
    }
  }, [id]);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setOt({ ...ot, [name]: value });
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...ot, costo: Number(ot.costo) }; // Asegurar tipo número
      if (id) {
        await actualizarOT(id, dataToSend);
      } else {
        await crearOT(dataToSend);
      }
      navigate("/ordenes_trabajo"); // Volver a la lista
    } catch (err) {
      console.error("Error al guardar OT:", err);
      alert("Hubo un error al guardar la orden de trabajo.");
    }
  };

  return (
    <div className="container mt-4">
      <h3>{id ? "Editar Orden de Trabajo" : "Nueva Orden de Trabajo"}</h3>
      <form onSubmit={handleSubmit}>
        <input
          name="activo_id"
          value={ot.activo_id}
          onChange={handleChange}
          placeholder="Activo ID"
          className="form-control mb-2"
          required
        />
        <input
          name="tipo"
          value={ot.tipo}
          onChange={handleChange}
          placeholder="Tipo"
          className="form-control mb-2"
          required
        />
        <input
          name="descripcion"
          value={ot.descripcion}
          onChange={handleChange}
          placeholder="Descripción"
          className="form-control mb-2"
          required
        />
        <input
          name="fecha_programada"
          type="date"
          value={ot.fecha_programada || ""}
          onChange={handleChange}
          className="form-control mb-2"
          required
        />
        <input
          name="trabajador_asignado"
          value={ot.trabajador_asignado}
          onChange={handleChange}
          placeholder="Trabajador asignado"
          className="form-control mb-2"
        />
        <input
          name="estado"
          value={ot.estado}
          onChange={handleChange}
          placeholder="Estado"
          className="form-control mb-2"
        />
        <input
          name="costo"
          type="number"
          step="0.01"
          value={ot.costo}
          onChange={handleChange}
          placeholder="Costo"
          className="form-control mb-2"
        />
        <button type="submit" className="btn btn-primary">
          {id ? "Actualizar" : "Crear"}
        </button>
      </form>
    </div>
  );
}
