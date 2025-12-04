import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { crearActivo, obtenerActivo, actualizarActivo } from "../services/RF01_activos.service.js";

// --- DATOS ESTÁTICOS PARA VEHÍCULOS (Marca -> Modelos) ---
const datosVehiculos = {
  "Toyota": ["Hilux", "Rav4", "Yaris", "Corolla", "Land Cruiser"],
  "Ford": ["Ranger", "F-150", "Explorer", "Territory", "Transit"],
  "Chevrolet": ["Silverado", "D-Max", "Colorado", "Tahoe", "N400"],
  "Nissan": ["Navara", "NP300", "Terrano", "Versa", "X-Trail"],
  "Hyundai": ["H-1", "Porter", "Santa Fe", "Tucson"],
  "Mitsubishi": ["L200", "Montero", "Outlander"]
};

// --- LISTA SIMPLE PARA TIPOS DE MAQUINARIA ---
const tiposMaquinaria = [
  "Retroexcavadora", 
  "Excavadora", 
  "Motoniveladora", 
  "Grúa Horquilla", 
  "Rodillo Compactador", 
  "Cargador Frontal", 
  "Camión Tolva", 
  "Generador",
  "Compresor",
  "Torre de Iluminación"
];

function ActivoForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [activo, setActivo] = useState({
    codigo: "",
    tipo: "", // 'Vehiculo' | 'Maquinaria'
    marca: "",
    modelo: "",
    anio: "",
    kilometraje_actual: "",
    horas_uso_actual: "",
    ubicacion: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [listaModelosVehiculo, setListaModelosVehiculo] = useState([]);

  useEffect(() => {
    if (location.state?.activo) {
      const { id, fecha_creacion, ...datosRecibidos } = location.state.activo;
      setActivo(prev => ({ ...prev, ...datosRecibidos }));
    } else if (id) {
      cargarActivoDesdeBackend();
    }
  }, [id, location.state]);

  // Efecto: Si es Vehículo y cambia la marca, actualizamos los modelos
  useEffect(() => {
    if (activo.tipo === "Vehiculo" && activo.marca && datosVehiculos[activo.marca]) {
      setListaModelosVehiculo(datosVehiculos[activo.marca]);
    } else {
      setListaModelosVehiculo([]);
    }
  }, [activo.marca, activo.tipo]);

  const cargarActivoDesdeBackend = async () => {
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

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    setActivo((prev) => {
      const nuevoEstado = { ...prev, [name]: type === "number" ? Number(value) : value };

      // Si cambia el TIPO principal
      if (name === "tipo") {
        if (value === "Maquinaria") {
            // Para maquinaria, la marca es fija (para cumplir con la BD) y limpiamos el modelo
            nuevoEstado.marca = "Maquinaria"; 
            nuevoEstado.modelo = "";
        } else {
            // Para vehículo, reseteamos ambos para que elija
            nuevoEstado.marca = "";
            nuevoEstado.modelo = "";
        }
      }

      // Si cambia la MARCA (Solo en vehículos), reseteamos el modelo
      if (name === "marca" && prev.tipo === "Vehiculo") {
        nuevoEstado.modelo = "";
      }

      return nuevoEstado;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  if (loading) return (
    <div className="text-center py-5 text-white">
      <div className="spinner-border text-primary" role="status"></div>
      <p className="mt-2">Cargando datos del activo...</p>
    </div>
  );

  // --- CONFIGURACIÓN DE VISUALIZACIÓN ---
  const inputClass = "form-control bg-dark text-white border-secondary focus-ring focus-ring-primary";
  const selectClass = "form-select bg-dark text-white border-secondary focus-ring focus-ring-primary";
  const labelClass = "form-label text-white-50 fw-semibold small";

  // Etiquetas dinámicas
  let labelCodigo = "Identificación (Código)";
  let placeholderCodigo = "Ej: ACT-001";
  
  if (activo.tipo === "Vehiculo") {
    labelCodigo = "Patente";
    placeholderCodigo = "Ej: AB-CD-12";
  } else if (activo.tipo === "Maquinaria") {
    labelCodigo = "Código Serial / VIN";
    placeholderCodigo = "Ej: CAT-2023-X99";
  }

  // Lista de marcas para Vehículos
  const marcasVehiculos = Object.keys(datosVehiculos);

  return (
    <form onSubmit={handleSubmit} className="p-2">
      <div className="row g-3">
        
        {/* --- TIPO DE ACTIVO --- */}
        <div className="col-md-6">
          <label className={labelClass}>Tipo de Activo</label>
          <select 
            name="tipo" 
            className={selectClass} 
            value={activo.tipo} 
            onChange={handleChange}
            required
          >
            <option value="">Seleccione tipo...</option>
            <option value="Vehiculo">Vehículo</option>
            <option value="Maquinaria">Maquinaria</option>
          </select>
        </div>

        {/* --- CÓDIGO / PATENTE / SERIAL --- */}
        <div className="col-md-6">
          <label className={labelClass}>{labelCodigo}</label>
          <div className="input-group">
            <span className="input-group-text bg-dark border-secondary text-secondary">
              <i className="bi bi-qr-code"></i>
            </span>
            <input
              type="text"
              name="codigo"
              className={inputClass}
              placeholder={placeholderCodigo}
              value={activo.codigo}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* --- SECCIÓN DINÁMICA: VEHÍCULO VS MAQUINARIA --- */}
        
        {activo.tipo === "Vehiculo" && (
          <>
            <div className="col-md-6">
              <label className={labelClass}>Marca del Vehículo</label>
              <select name="marca" className={selectClass} value={activo.marca} onChange={handleChange} required>
                <option value="">Seleccione marca...</option>
                {marcasVehiculos.map(marca => (
                  <option key={marca} value={marca}>{marca}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className={labelClass}>Modelo del Vehículo</label>
              <select 
                name="modelo" 
                className={selectClass} 
                value={activo.modelo} 
                onChange={handleChange} 
                required
                disabled={!activo.marca}
              >
                <option value="">{activo.marca ? "Seleccione modelo..." : "Primero seleccione marca"}</option>
                {listaModelosVehiculo.map(modelo => (
                  <option key={modelo} value={modelo}>{modelo}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {activo.tipo === "Maquinaria" && (
          <div className="col-12">
            <label className={labelClass}>Clase de Maquinaria</label>
            <select 
                name="modelo" // Guardamos la clase en el campo 'modelo' de la BD
                className={selectClass} 
                value={activo.modelo} 
                onChange={handleChange} 
                required
            >
              <option value="">Seleccione clase de equipo...</option>
              {tiposMaquinaria.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            <div className="form-text text-secondary small">
                Seleccione el tipo de equipo. La marca se registrará automáticamente como 'Maquinaria'.
            </div>
          </div>
        )}

        {/* --- DATOS COMUNES --- */}
        <div className="col-md-4">
          <label className={labelClass}>Año</label>
          <input type="number" name="anio" className={inputClass} value={activo.anio} onChange={handleChange} placeholder="Ej: 2023" />
        </div>
        <div className="col-md-4">
          <label className={labelClass}>Kilometraje</label>
          <input type="number" name="kilometraje_actual" className={inputClass} value={activo.kilometraje_actual} onChange={handleChange} placeholder="0" />
        </div>
        <div className="col-md-4">
          <label className={labelClass}>Horas de Uso</label>
          <input type="number" name="horas_uso_actual" className={inputClass} value={activo.horas_uso_actual} onChange={handleChange} placeholder="0" />
        </div>

        <div className="col-12">
          <label className={labelClass}>Ubicación Actual</label>
          <div className="input-group">
            <span className="input-group-text bg-dark border-secondary text-secondary"><i className="bi bi-geo-alt"></i></span>
            <input type="text" name="ubicacion" className={inputClass} value={activo.ubicacion} onChange={handleChange} placeholder="Ej: Bodega Central" />
          </div>
        </div>

        <div className="col-12 mt-4 d-flex justify-content-end gap-2">
            <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/activos')}
            >
                Cancelar
            </button>
            <button type="submit" className="btn btn-success px-4 d-flex align-items-center gap-2">
                <i className="bi bi-save"></i>
                {id ? "Guardar Cambios" : "Registrar Activo"}
            </button>
        </div>
      </div>
    </form>
  );
}

export default ActivoForm;