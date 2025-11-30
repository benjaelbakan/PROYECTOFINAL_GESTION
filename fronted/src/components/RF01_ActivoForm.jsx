import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { crearActivo, obtenerActivo, actualizarActivo } from "../services/RF01_activos.service.js";

function ActivoForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); // si existe, es edición

  const [activo, setActivo] = useState({
    codigo: "",
    tipo: "",
    marca: "",
    modelo: "",
    anio: "",
    kilometraje_actual: "",
    horas_uso_actual: "",
    ubicacion: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.activo) {
      const { id, fecha_creacion, ...cleanActivo } = location.state.activo;
      setActivo(cleanActivo);
    } else if (id) {
      const cargarActivo = async () => {
        setLoading(true);
        try {
          const data = await obtenerActivo(id);
          if (data) {
            const { id, fecha_creacion, ...cleanActivo } = data;
            setActivo(cleanActivo);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      cargarActivo();
    }
  }, [id, location.state]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setActivo((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Solo enviar los campos que la DB espera
    const activoToSend = {
      codigo: activo.codigo,
      tipo: activo.tipo,
      marca: activo.marca,
      modelo: activo.modelo,
      anio: Number(activo.anio),
      kilometraje_actual: Number(activo.kilometraje_actual),
      horas_uso_actual: Number(activo.horas_uso_actual),
      ubicacion: activo.ubicacion
    };

    try {
      if (id) {
        await actualizarActivo(id, activoToSend);
      } else {
        await crearActivo(activoToSend);
      }
      navigate("/activos");
    } catch (err) {
      console.error("Error al guardar el activo:", err);
      alert("Error al guardar el activo");
    }
  };

  if (loading) return <p>Cargando activo...</p>;

  return (
    <div className="container mt-4">
      <h3>{id ? "Editar Activo" : "Nuevo Activo"}</h3>
      <form onSubmit={handleSubmit}>
        {[
          { label: "Código", name: "codigo" },
          { label: "Tipo", name: "tipo" },
          { label: "Marca", name: "marca" },
          { label: "Modelo", name: "modelo" },
          { label: "Año", name: "anio", type: "number" },
          { label: "Kilometraje actual", name: "kilometraje_actual", type: "number" },
          { label: "Horas de uso actual", name: "horas_uso_actual", type: "number" },
          { label: "Ubicación", name: "ubicacion" }
        ].map((field) => (
          <div className="mb-3" key={field.name}>
            <label className="form-label">{field.label}</label>
            <input
              type={field.type || "text"}
              name={field.name}
              className="form-control"
              value={activo[field.name] ?? ""}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        <button type="submit" className="btn btn-success">
          Guardar
        </button>
      </form>
    </div>
  );
}

export default ActivoForm;
