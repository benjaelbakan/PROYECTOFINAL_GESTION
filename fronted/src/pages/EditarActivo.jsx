// fronted/src/pages/EditarActivo.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function EditarActivo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    codigo: "",
    tipo: "VEHICULO",
    marca: "",
    modelo: "",
    anio: "",
    kilometraje_actual: "",
    horas_uso_actual: "",
    ubicacion: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const cargarActivo = async () => {
      try {
        const res = await axios.get(`/api/activos/${id}`);
        const data = res.data;

        setForm({
          codigo: data.codigo || "",
          tipo: data.tipo || "VEHICULO",
          marca: data.marca || "",
          modelo: data.modelo || "",
          anio: data.anio ?? "",
          kilometraje_actual: data.kilometraje_actual ?? "",
          horas_uso_actual: data.horas_uso_actual ?? "",
          ubicacion: data.ubicacion || "",
        });
      } catch (err) {
        console.error("Error al cargar activo:", err);
        setErrorMsg("No se pudo cargar el activo.");
      } finally {
        setLoading(false);
      }
    };

    cargarActivo();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Evitar números negativos en km/horas
    if (
      (name === "kilometraje_actual" || name === "horas_uso_actual") &&
      value.startsWith("-")
    ) {
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    const currentYear = new Date().getFullYear();

    if (!form.codigo.trim()) newErrors.codigo = "El código es obligatorio.";
    if (!form.tipo) newErrors.tipo = "Debes seleccionar un tipo.";
    if (!form.marca.trim() || form.marca.trim().length < 2)
      newErrors.marca = "La marca debe tener al menos 2 caracteres.";
    if (!form.modelo.trim() || form.modelo.trim().length < 2)
      newErrors.modelo = "El modelo debe tener al menos 2 caracteres.";

    if (form.anio !== "") {
      const anioNum = Number(form.anio);
      if (Number.isNaN(anioNum)) {
        newErrors.anio = "El año debe ser numérico.";
      } else if (anioNum < 1900 || anioNum > currentYear + 1) {
        newErrors.anio = `El año debe estar entre 1900 y ${currentYear + 1}.`;
      }
    }

    if (form.kilometraje_actual !== "") {
      const km = Number(form.kilometraje_actual);
      if (Number.isNaN(km) || km < 0) {
        newErrors.kilometraje_actual =
          "El kilometraje debe ser un número mayor o igual a 0.";
      }
    }

    if (form.horas_uso_actual !== "") {
      const h = Number(form.horas_uso_actual);
      if (Number.isNaN(h) || h < 0) {
        newErrors.horas_uso_actual =
          "Las horas de uso deben ser un número mayor o igual a 0.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validateForm()) return;

    setSaving(true);

    try {
      const payload = {
        ...form,
        anio: form.anio ? Number(form.anio) : null,
        kilometraje_actual: form.kilometraje_actual
          ? Number(form.kilometraje_actual)
          : null,
        horas_uso_actual: form.horas_uso_actual
          ? Number(form.horas_uso_actual)
          : null,
      };

      await axios.put(`/api/activos/${id}`, payload);
      navigate("/");
    } catch (err) {
      console.error("Error al actualizar activo:", err);
      setErrorMsg("Error al actualizar el activo.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card bg-dark border-secondary shadow-sm">
              <div className="card-body">
                <p className="mb-0">Cargando activo...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Título + botón volver */}
      <div className="row justify-content-center mb-3">
        <div className="col-lg-8 col-xl-7 d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Editar activo #{id}</h4>
          <button
            className="btn btn-outline-light btn-sm"
            type="button"
            onClick={() => navigate("/")}
          >
            Volver al listado
          </button>
        </div>
      </div>

      {/* Card del formulario */}
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-7">
          {errorMsg && (
            <div className="alert alert-danger py-2 mb-3">{errorMsg}</div>
          )}

          <div className="card bg-dark border-secondary shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Código */}
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="codigo">
                      Código *
                    </label>
                    <input
                      id="codigo"
                      className="form-control form-control-sm"
                      name="codigo"
                      value={form.codigo}
                      onChange={handleChange}
                    />
                    {errors.codigo && (
                      <div className="text-danger small mt-1">
                        {errors.codigo}
                      </div>
                    )}
                  </div>

                  {/* Tipo */}
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="tipo">
                      Tipo *
                    </label>
                    <select
                      id="tipo"
                      className="form-select form-select-sm"
                      name="tipo"
                      value={form.tipo}
                      onChange={handleChange}
                    >
                      <option value="VEHICULO">Vehículo</option>
                      <option value="MAQUINARIA">Maquinaria</option>
                    </select>
                    {errors.tipo && (
                      <div className="text-danger small mt-1">
                        {errors.tipo}
                      </div>
                    )}
                  </div>

                  {/* Marca */}
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="marca">
                      Marca *
                    </label>
                    <input
                      id="marca"
                      className="form-control form-control-sm"
                      name="marca"
                      value={form.marca}
                      onChange={handleChange}
                    />
                    {errors.marca && (
                      <div className="text-danger small mt-1">
                        {errors.marca}
                      </div>
                    )}
                  </div>

                  {/* Modelo */}
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="modelo">
                      Modelo *
                    </label>
                    <input
                      id="modelo"
                      className="form-control form-control-sm"
                      name="modelo"
                      value={form.modelo}
                      onChange={handleChange}
                    />
                    {errors.modelo && (
                      <div className="text-danger small mt-1">
                        {errors.modelo}
                      </div>
                    )}
                  </div>

                  {/* Año */}
                  <div className="col-md-4">
                    <label className="form-label" htmlFor="anio">
                      Año
                    </label>
                    <input
                      id="anio"
                      type="number"
                      className="form-control form-control-sm"
                      name="anio"
                      value={form.anio}
                      onChange={handleChange}
                    />
                    {errors.anio && (
                      <div className="text-danger small mt-1">
                        {errors.anio}
                      </div>
                    )}
                  </div>

                  {/* Kilometraje actual */}
                  <div className="col-md-4">
                    <label
                      className="form-label"
                      htmlFor="kilometraje_actual"
                    >
                      Kilometraje actual
                    </label>
                    <input
                      id="kilometraje_actual"
                      type="number"
                      className="form-control form-control-sm"
                      name="kilometraje_actual"
                      value={form.kilometraje_actual}
                      onChange={handleChange}
                    />
                    {errors.kilometraje_actual && (
                      <div className="text-danger small mt-1">
                        {errors.kilometraje_actual}
                      </div>
                    )}
                  </div>

                  {/* Horas de uso actuales */}
                  <div className="col-md-4">
                    <label className="form-label" htmlFor="horas_uso_actual">
                      Horas de uso actuales
                    </label>
                    <input
                      id="horas_uso_actual"
                      type="number"
                      className="form-control form-control-sm"
                      name="horas_uso_actual"
                      value={form.horas_uso_actual}
                      onChange={handleChange}
                    />
                    {errors.horas_uso_actual && (
                      <div className="text-danger small mt-1">
                        {errors.horas_uso_actual}
                      </div>
                    )}
                  </div>

                  {/* Ubicación */}
                  <div className="col-12">
                    <label className="form-label" htmlFor="ubicacion">
                      Ubicación
                    </label>
                    <input
                      id="ubicacion"
                      className="form-control form-control-sm"
                      name="ubicacion"
                      value={form.ubicacion}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    type="submit"
                    className="btn btn-success btn-sm"
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
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

export default EditarActivo;
