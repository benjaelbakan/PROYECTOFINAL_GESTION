import { useEffect, useState } from "react";
import axios from "axios";

function Planificacion() {
  const [planes, setPlanes] = useState([]);
  const [activos, setActivos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [form, setForm] = useState({
    activo_id: "",
    basado_en: "TIEMPO",
    frecuencia_dias: "",
    frecuencia_km: "",
    frecuencia_horas: "",
    descripcion: "",
  });

  useEffect(() => {
    cargarPlanes();
    cargarActivos();
  }, []);

  const cargarPlanes = async () => {
    try {
      const res = await axios.get("/api/planes");
      setPlanes(res.data);
    } catch (err) {
      console.error(err);
      setMensaje("Error al cargar los planes de mantenimiento");
    }
  };

  const cargarActivos = async () => {
    try {
      const res = await axios.get("/api/activos");
      setActivos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔎 Validación según tipo de plan
  const validarFormulario = () => {
    const { basado_en, frecuencia_dias, frecuencia_km, frecuencia_horas } = form;

    // TIEMPO → frecuencia_dias obligatoria
    if (basado_en === "TIEMPO") {
      if (!frecuencia_dias || Number(frecuencia_dias) <= 0) {
        setMensaje(
          "Para planes basados en TIEMPO debes ingresar la frecuencia en días."
        );
        return false;
      }
    }

    // KILOMETRAJE → frecuencia_km obligatoria
    if (basado_en === "KILOMETRAJE") {
      if (!frecuencia_km || Number(frecuencia_km) <= 0) {
        setMensaje(
          "Para planes basados en KILOMETRAJE debes ingresar la frecuencia en km."
        );
        return false;
      }
    }

    // HORAS → frecuencia_horas obligatoria
    if (basado_en === "HORAS") {
      if (!frecuencia_horas || Number(frecuencia_horas) <= 0) {
        setMensaje(
          "Para planes basados en HORAS debes ingresar la frecuencia en horas."
        );
        return false;
      }
    }

    // MIXTO → al menos una de las tres frecuencias
    if (basado_en === "MIXTO") {
      if (
        (!frecuencia_dias || Number(frecuencia_dias) <= 0) &&
        (!frecuencia_km || Number(frecuencia_km) <= 0) &&
        (!frecuencia_horas || Number(frecuencia_horas) <= 0)
      ) {
        setMensaje(
          "Para planes MIXTOS debes ingresar al menos una frecuencia (días, km u horas)."
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    // ✅ si la validación falla, no se envía al backend
    if (!validarFormulario()) {
      return;
    }

    try {
      await axios.post("/api/planes", form);
      setMensaje("Plan de mantenimiento creado correctamente");
      setForm({
        activo_id: "",
        basado_en: "TIEMPO",
        frecuencia_dias: "",
        frecuencia_km: "",
        frecuencia_horas: "",
        descripcion: "",
      });
      cargarPlanes();
    } catch (err) {
      console.error(err);
      setMensaje("Error al crear el plan de mantenimiento");
    }
  };

  const formatoFrecuencia = (p) => {
    const partes = [];
    if (p.frecuencia_dias) partes.push(`${p.frecuencia_dias} días`);
    if (p.frecuencia_km) partes.push(`${p.frecuencia_km} km`);
    if (p.frecuencia_horas) partes.push(`${p.frecuencia_horas} horas`);
    return partes.join(" / ") || "-";
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4 text-white">Planificación de Mantenimiento</h1>

      {mensaje && (
        <div
          className={
            "alert " +
            (mensaje.startsWith("Error") ? "alert-danger" : "alert-success")
          }
        >
          {mensaje}
        </div>
      )}

      {/* Formulario */}
      <form
        className="card shadow-sm border-0 mb-4 bg-dark"
        onSubmit={handleSubmit}
      >
        <div className="card-header bg-primary text-white">
          <h2 className="h5 mb-0">Nuevo plan de mantenimiento</h2>
        </div>

        <div className="card-body text-dark bg-dark">
          <div className="row mb-3">
            <div className="col-md-4">
              <label
                className="form-label fw-semibold"
                style={{ color: "#000000" }}
              >
                Activo
              </label>
              <select
                className="form-select bg-white text-dark"
                name="activo_id"
                value={form.activo_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un activo</option>
                {activos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.codigo} - {a.marca} {a.modelo}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label
                className="form-label fw-semibold"
                style={{ color: "#000000" }}
              >
                Basado en
              </label>
              <select
                className="form-select bg-white text-dark"
                name="basado_en"
                value={form.basado_en}
                onChange={handleChange}
              >
                <option value="TIEMPO">Tiempo (días)</option>
                <option value="KILOMETRAJE">Kilometraje (km)</option>
                <option value="HORAS">Horas de uso</option>
                <option value="MIXTO">Mixto</option>
              </select>
            </div>

            <div className="col-md-4">
              <label
                className="form-label fw-semibold"
                style={{ color: "#000000" }}
              >
                Descripción
              </label>
              <input
                type="text"
                className="form-control bg-white text-dark"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Ej: Cambio aceite cada 10.000 km"
              />
            </div>
          </div>

          {/* Frecuencias */}
          <div className="row mb-4">
            <div className="col-md-4">
              <label
                className="form-label fw-semibold"
                style={{ color: "#000000" }}
              >
                Frecuencia en días
              </label>
              <input
                type="number"
                className="form-control bg-white text-dark"
                name="frecuencia_dias"
                value={form.frecuencia_dias}
                onChange={handleChange}
                placeholder="Ej: 30"
              />
            </div>
            <div className="col-md-4">
              <label
                className="form-label fw-semibold"
                style={{ color: "#000000" }}
              >
                Frecuencia en km
              </label>
              <input
                type="number"
                className="form-control bg-white text-dark"
                name="frecuencia_km"
                value={form.frecuencia_km}
                onChange={handleChange}
                placeholder="Ej: 10000"
              />
            </div>
            <div className="col-md-4">
              <label
                className="form-label fw-semibold"
                style={{ color: "#000000" }}
              >
                Frecuencia en horas
              </label>
              <input
                type="number"
                className="form-control bg-white text-dark"
                name="frecuencia_horas"
                value={form.frecuencia_horas}
                onChange={handleChange}
                placeholder="Ej: 200"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-success w-100">
            Guardar plan
          </button>
        </div>
      </form>

      {/* Tabla de planes */}
      <div className="card shadow-sm border-0 bg-dark">
        <div className="card-header bg-secondary text-white">
          <h2 className="h5 mb-0">Planes registrados</h2>
        </div>
        <div className="card-body p-0">
          <table className="table mb-0">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Activo</th>
                <th>Basado en</th>
                <th>Frecuencia</th>
                <th>Creado en</th>
              </tr>
            </thead>
            <tbody>
              {planes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-3 text-white-50">
                    No hay planes registrados.
                  </td>
                </tr>
              ) : (
                planes.map((p) => (
                  <tr key={p.id} className="table-dark text-white">
                    <td>{p.id}</td>
                    <td>
                      {p.codigo_activo} - {p.marca} {p.modelo}
                    </td>
                    <td>{p.basado_en}</td>
                    <td>{formatoFrecuencia(p)}</td>
                    <td>
                      {p.creado_en
                        ? new Date(p.creado_en).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Planificacion;
