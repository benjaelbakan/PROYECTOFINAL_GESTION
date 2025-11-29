import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Regex para Patente Chilena
const PATENTE_REGEX = /^([A-Z]{4}\d{2}|[A-Z]{2}\d{4})$/;

// --- BASE DE DATOS DE MARCAS Y MODELOS ---
const DATA_VEHICULOS = {
  "Toyota": ["Hilux", "Yaris", "Corolla", "Rav4", "Fortuner", "4Runner", "Land Cruiser"],
  "Chevrolet": ["D-Max", "Sail", "Silverado", "Tahoe", "Colorado", "N400", "Groove"],
  "Nissan": ["Navara", "Terrano", "Versa", "Sentra", "NP300", "Kicks", "X-Trail"],
  "Ford": ["Ranger", "F-150", "Explorer", "Ecosport", "Territory", "Maverick"],
  "Mitsubishi": ["L200", "Montero", "Outlander", "Mirage", "Eclipse Cross"],
  "Hyundai": ["H-1", "Porter", "Santa Fe", "Tucson", "Accent", "Creta"],
  "Kia": ["Frontier", "Sorento", "Sportage", "Rio", "Soluto", "Morning"],
  "Peugeot": ["Partner", "Boxer", "Expert", "3008", "2008", "Landtrek"],
  "Mercedes-Benz": ["Sprinter", "Vito", "Actros", "Arocs", "Atego"],
  "Volkswagen": ["Amarok", "Transporter", "Saveiro", "Crafter", "T-Cross"],
  "JAC": ["T6", "T8", "Sunray", "Refine", "X200"],
  "Maxus": ["T60", "T90", "V80", "G10", "Deliver 9"],
  "RAM": ["700", "1000", "1500", "2500", "V700"],
  "Otro": [] 
};

function CrearActivo() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    codigo: "",
    tipo: "VEHICULO",
    marca: "",
    otraMarca: "",
    modelo: "",
    anio: "",
    kilometraje_actual: "",
    horas_uso_actual: "",
    ubicacion: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState({});

  const currentYear = new Date().getFullYear();
  const yearsList = Array.from({ length: currentYear - 1980 + 2 }, (_, i) => currentYear + 1 - i);

  const listaMarcas = Object.keys(DATA_VEHICULOS)
    .filter(marca => marca !== "Otro")
    .sort()
    .concat("Otro");

  const listaModelos = form.marca && DATA_VEHICULOS[form.marca] ? DATA_VEHICULOS[form.marca] : [];

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "tipo") {
      setForm((prev) => ({
        ...prev,
        tipo: value,
        codigo: "",
        marca: value === "MAQUINARIA" ? "GENERICA" : "",
        otraMarca: "",
        modelo: "",
      }));
      setErrors({});
      return;
    }

    if (name === "marca" && form.tipo === "VEHICULO") {
      setForm((prev) => ({
        ...prev,
        marca: value,
        otraMarca: "",
        modelo: "",
      }));
      return;
    }

    if (name === "codigo") {
      if (form.tipo === "VEHICULO") {
        value = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
      } else {
        value = value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 20);
      }
    }

    if ((name === "kilometraje_actual" || name === "horas_uso_actual") && value.startsWith("-")) {
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (form.tipo === "VEHICULO") {
      if (!form.codigo.trim()) newErrors.codigo = "La patente es obligatoria.";
      else if (!PATENTE_REGEX.test(form.codigo)) newErrors.codigo = "Formato inválido (Ej: BBCL12).";

      if (!form.marca) {
        newErrors.marca = "Selecciona una marca.";
      } else if (form.marca === "Otro" && !form.otraMarca.trim()) {
        newErrors.marca = "Debes especificar la marca.";
      }
      
      if (!form.modelo.trim()) newErrors.modelo = "Selecciona o escribe un modelo.";

    } else {
      if (!form.codigo.trim()) newErrors.codigo = "El N° Serie es obligatorio.";
      if (!form.modelo.trim()) newErrors.modelo = "Indica el tipo de maquinaria.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data: lista } = await axios.get("/api/activos");
      const existe = lista.some(a => a.codigo?.trim().toLowerCase() === form.codigo.trim().toLowerCase());
      
      if (existe) {
        setErrors((prev) => ({ ...prev, codigo: "Ya existe un activo con este código." }));
        setLoading(false);
        return;
      }

      let marcaFinal = form.marca;
      if (form.tipo === "VEHICULO" && form.marca === "Otro") {
        marcaFinal = form.otraMarca.toUpperCase();
      } else if (form.tipo === "MAQUINARIA") {
        marcaFinal = "GENERICA";
      }

      const payload = {
        ...form,
        marca: marcaFinal,
        anio: form.anio ? Number(form.anio) : null,
        kilometraje_actual: form.kilometraje_actual ? Number(form.kilometraje_actual) : null,
        horas_uso_actual: form.horas_uso_actual ? Number(form.horas_uso_actual) : null,
      };
      delete payload.otraMarca;

      await axios.post("/api/activos", payload);
      setSuccessMsg("Activo registrado correctamente ✅");
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      console.error("Error:", err);
      setErrorMsg("Error al registrar. Revisa los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-9">
          
          {/* Cabecera */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0 text-white">Nuevo Activo</h2>
            <button
              className="btn btn-outline-info"
              onClick={() => navigate("/")}
            >
              Ver Listado
            </button>
          </div>

          {/* Mensajes */}
          {errorMsg && <div className="alert alert-danger border-danger d-flex align-items-center">{errorMsg}</div>}
          {successMsg && <div className="alert alert-success border-success d-flex align-items-center">{successMsg}</div>}

          {/* Tarjeta del Formulario */}
          <div className="card bg-dark border-secondary shadow">
            <div className="card-header border-secondary bg-transparent py-3">
              <h5 className="mb-0 text-white-50">Registro de Flota y Maquinaria</h5>
            </div>
            
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                
                {/* SECCIÓN 1: IDENTIFICACIÓN */}
                <h6 className="text-info text-uppercase fw-bold small mb-3">1. Identificación del Activo</h6>
                <div className="row g-3 mb-4">
                  
                  <div className="col-md-6">
                    <label className="form-label text-white">Tipo de Activo <span className="text-danger">*</span></label>
                    <select
                      className="form-select bg-dark text-white border-secondary"
                      name="tipo"
                      value={form.tipo}
                      onChange={handleChange}
                    >
                      <option value="VEHICULO">Vehículo</option>
                      <option value="MAQUINARIA">Maquinaria</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-white">
                      {form.tipo === "VEHICULO" ? "Patente" : "N° de Serie"} <span className="text-danger">*</span>
                    </label>
                    <input
                      className="form-control bg-dark text-white border-secondary text-uppercase fw-bold"
                      name="codigo"
                      value={form.codigo}
                      onChange={handleChange}
                      placeholder={form.tipo === "VEHICULO" ? "Ej: BBCL12" : "Ej: SN-98765"}
                      maxLength={form.tipo === "VEHICULO" ? 6 : 20}
                    />
                    {errors.codigo && <div className="text-danger small mt-1">{errors.codigo}</div>}
                  </div>

                  {/* CAMPOS DINÁMICOS: MARCA Y MODELO */}
                  {form.tipo === "VEHICULO" ? (
                    <>
                      <div className="col-md-6">
                        <label className="form-label text-white">Marca <span className="text-danger">*</span></label>
                        <select
                          className="form-select bg-dark text-white border-secondary"
                          name="marca"
                          value={form.marca}
                          onChange={handleChange}
                        >
                          <option value="">Seleccionar Marca...</option>
                          {listaMarcas.map(marca => (
                            <option key={marca} value={marca}>{marca}</option>
                          ))}
                        </select>
                        
                        {form.marca === "Otro" && (
                          <input 
                            className="form-control bg-dark text-white border-secondary mt-2"
                            name="otraMarca"
                            value={form.otraMarca}
                            onChange={handleChange}
                            placeholder="Especifique la marca..."
                          />
                        )}
                        {errors.marca && <div className="text-danger small mt-1">{errors.marca}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-white">Modelo <span className="text-danger">*</span></label>
                        {form.marca === "Otro" ? (
                           <input
                             className="form-control bg-dark text-white border-secondary"
                             name="modelo"
                             value={form.modelo}
                             onChange={handleChange}
                             placeholder="Escribe el modelo..."
                           />
                        ) : (
                          <select
                            className="form-select bg-dark text-white border-secondary"
                            name="modelo"
                            value={form.modelo}
                            onChange={handleChange}
                            disabled={!form.marca}
                          >
                            <option value="">{form.marca ? "Seleccionar Modelo..." : "← Elige Marca primero"}</option>
                            {listaModelos.map(mod => (
                              <option key={mod} value={mod}>{mod}</option>
                            ))}
                            <option value="Otro">Otro / No listado</option>
                          </select>
                        )}
                        {errors.modelo && <div className="text-danger small mt-1">{errors.modelo}</div>}
                      </div>
                    </>
                  ) : (
                    <div className="col-md-12">
                      <label className="form-label text-white">Tipo de Maquinaria <span className="text-danger">*</span></label>
                      <input
                        className="form-control bg-dark text-white border-secondary"
                        name="modelo"
                        value={form.modelo}
                        onChange={handleChange}
                        placeholder="Ej: Grúa Horquilla, Generador, Retroexcavadora..."
                      />
                      {errors.modelo && <div className="text-danger small mt-1">{errors.modelo}</div>}
                    </div>
                  )}
                </div>

                <hr className="border-secondary my-4 opacity-25" />

                {/* SECCIÓN 2: DETALLES TÉCNICOS */}
                <h6 className="text-warning text-uppercase fw-bold small mb-3">2. Detalles Técnicos y Ubicación</h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label text-white">Año</label>
                    <select
                      className="form-select bg-dark text-white border-secondary"
                      name="anio"
                      value={form.anio}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar...</option>
                      {yearsList.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-white">Kilometraje Inicial</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control bg-dark text-white border-secondary"
                        name="kilometraje_actual"
                        value={form.kilometraje_actual}
                        onChange={handleChange}
                        min="0"
                        disabled={form.tipo === "MAQUINARIA"}
                        placeholder={form.tipo === "MAQUINARIA" ? "N/A" : "0"}
                      />
                      <span className="input-group-text bg-secondary border-secondary text-white-50 small">km</span>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label text-white">Horas de Uso</label>
                    <div className="input-group">
                      <input
                        type="number"
                        className="form-control bg-dark text-white border-secondary"
                        name="horas_uso_actual"
                        value={form.horas_uso_actual}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                      />
                      <span className="input-group-text bg-secondary border-secondary text-white-50 small">hrs</span>
                    </div>
                  </div>

                  <div className="col-12 mt-3">
                    <label className="form-label text-white">Ubicación Actual</label>
                    <input
                      className="form-control bg-dark text-white border-secondary"
                      name="ubicacion"
                      value={form.ubicacion}
                      onChange={handleChange}
                      placeholder="Ej: Taller Central, Obra Norte..."
                    />
                  </div>
                </div>

                {/* BOTONES */}
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
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Guardando...
                      </>
                    ) : (
                      "Guardar Activo"
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

export default CrearActivo;