import { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';

function RegistroTarea() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formulario, setFormulario] = useState({
    orden_id: '',
    descripcion: '',
    insumos: '',
    horas: '',
    costo: ''
  });

  const [mensaje, setMensaje] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [verTareas, setVerTareas] = useState(false);
  
  // Nuevo estado para la lista desplegable de OTs
  const [listaOTs, setListaOTs] = useState([]);

  // Modo edición
  const [modoEditar, setModoEditar] = useState(false);
  const [tareaId, setTareaId] = useState(null);

  useEffect(() => {
    cargarListas(); // Cargar OTs al iniciar
    if (id) {
      cargarTareaEnFormulario(id);
    }
  }, [id]);

  // Cargar lista de OTs para el select
  const cargarListas = async () => {
    try {
      // Usamos la ruta que devuelve todas las órdenes
      const res = await axios.get("http://localhost:3001/api/ordenes/orden_trabajo");
      setListaOTs(res.data);
    } catch (error) {
      console.error("Error al cargar OTs:", error);
    }
  };

  // Manejo de inputs
  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  // Crear tarea
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);

    try {
      const respuesta = await axios.post('http://localhost:3001/api/tareas', formulario);
      setMensaje({ tipo: 'success', texto: '✅ Tarea registrada correctamente (ID: ' + respuesta.data.id + ')' });
      setFormulario({ orden_id: '', descripcion: '', insumos: '', horas: '', costo: '' });
      cargarTareas();
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'danger', texto: '❌ Error al registrar tarea.' });
    }
  };

  // Actualizar tarea
  const handleActualizar = async (e) => {
    e.preventDefault();
    setMensaje(null);

    try {
      await axios.put(`http://localhost:3001/api/tareas/${tareaId}`, formulario);
      setMensaje({ tipo: 'success', texto: '✏️ Tarea actualizada correctamente.' });
      setFormulario({ orden_id: '', descripcion: '', insumos: '', horas: '', costo: '' });
      setModoEditar(false);
      setTareaId(null);
      cargarTareas();
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'danger', texto: '❌ Error al actualizar tarea.' });
    }
  };

  // Obtener lista de tareas (historial)
  const cargarTareas = async () => {
    try {
      const respuesta = await axios.get('http://localhost:3001/api/tareas');
      setTareas(respuesta.data);
      setVerTareas(true);
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'danger', texto: '❌ No se pudieron cargar las tareas.' });
    }
  };

  // Cargar datos en formulario para editar
  const cargarTareaEnFormulario = async (id) => {
    try {
      const respuesta = await axios.get(`http://localhost:3001/api/tareas/${id}`);
      const data = respuesta.data;

      setFormulario({
        orden_id: data.orden_id ?? '',
        descripcion: data.descripcion ?? '',
        insumos: data.insumos ?? '',
        horas: data.horas ?? '',
        costo: data.costo ?? ''
      });

      setTareaId(id);
      setModoEditar(true);
      setMensaje({ tipo: 'info', texto: `✏️ Editando tarea ID ${id}` });
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'danger', texto: '❌ Error al cargar la tarea.' });
    }
  };

  // Eliminar tarea
  const eliminarTarea = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta tarea?")) return;
    try {
      await axios.delete(`http://localhost:3001/api/tareas/${id}`);
      cargarTareas();
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'danger', texto: '❌ Error al eliminar la tarea.' });
    }
  };

  const inputClass = "form-control bg-dark text-white border-secondary focus-ring focus-ring-primary";
  const selectClass = "form-select bg-dark text-white border-secondary focus-ring focus-ring-primary";
  const labelClass = "form-label text-white-50 fw-semibold small";

  return (
    <div className="container mt-5">
      
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
            
          {/* --- BOTÓN VOLVER --- */}
          <div className="mb-3">
            <button 
                className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 text-white-50 hover-white"
                onClick={() => navigate('/tareas')}
            >
                <i className="bi bi-arrow-left"></i>
                Volver al Historial
            </button>
          </div>

          <div className="card bg-dark border border-secondary shadow-lg rounded-4">
            
            {/* Header de la Card */}
            <div className="card-header bg-transparent border-bottom border-secondary p-4">
              <h4 className="mb-0 text-white d-flex align-items-center gap-2">
                <i className={`bi ${modoEditar ? 'bi-pencil-square text-warning' : 'bi-hammer text-primary'}`}></i>
                {modoEditar ? "Editar Registro de Tarea" : "Registro de Tarea Realizada"}
              </h4>
              <p className="text-secondary small mb-0 mt-1">
                 Vincule la tarea realizada a una Orden de Trabajo existente.
              </p>
            </div>
            
            <div className="card-body p-4">

              {mensaje && (
                  <div className={`alert alert-${mensaje.tipo} d-flex align-items-center mb-4`}>
                      <i className="bi bi-info-circle-fill me-2"></i>
                      {mensaje.texto}
                  </div>
              )}

              {/* FORMULARIO */}
              <form onSubmit={modoEditar ? handleActualizar : handleSubmit}>

                <div className="mb-3">
                  <label className={labelClass}>Orden de Trabajo (OT)</label>
                  <div className="input-group">
                      <span className="input-group-text bg-dark border-secondary text-secondary"><i className="bi bi-list-check"></i></span>
                      
                      {/* SELECTOR DE OTs */}
                      <select
                        name="orden_id"
                        className={selectClass}
                        value={formulario.orden_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione una Orden...</option>
                        {listaOTs.map(ot => (
                            <option key={ot.id} value={ot.id}>
                                #{ot.id} - {ot.descripcion} ({ot.estado})
                            </option>
                        ))}
                      </select>
                  </div>
                  <div className="form-text text-secondary small">Seleccione la OT a la cual pertenece esta labor.</div>
                </div>

                <div className="mb-3">
                  <label className={labelClass}>Descripción del Trabajo Realizado</label>
                  <textarea
                    className={inputClass}
                    name="descripcion"
                    rows="3"
                    placeholder="Detalle técnico de la labor..."
                    value={formulario.descripcion}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className={labelClass}>Insumos Utilizados</label>
                  <input 
                    type="text"
                    className={inputClass}
                    name="insumos"
                    placeholder="Ej: Aceite, Filtros, Repuestos..."
                    value={formulario.insumos}
                    onChange={handleChange}
                  />
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className={labelClass}>Horas Hombre</label>
                    <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary text-secondary"><i className="bi bi-clock"></i></span>
                        <input 
                          type="number"
                          step="0.5"
                          className={inputClass}
                          name="horas"
                          placeholder="0.0"
                          value={formulario.horas}
                          onChange={handleChange}
                        />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className={labelClass}>Costo Mano de Obra/Extra ($)</label>
                    <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary text-secondary">$</span>
                        <input 
                          type="number"
                          className={inputClass}
                          name="costo"
                          placeholder="0"
                          value={formulario.costo}
                          onChange={handleChange}
                        />
                    </div>
                  </div>
                </div>

                <div className="d-grid gap-2 mt-4">
                    <button className={`btn btn-lg ${modoEditar ? 'btn-warning' : 'btn-success'} fw-semibold shadow-sm`}>
                      {modoEditar ? (
                          <><i className="bi bi-pencil-square me-2"></i>Guardar Cambios</>
                      ) : (
                          <><i className="bi bi-save me-2"></i>Guardar Tarea</>
                      )}
                    </button>

                    {modoEditar && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setModoEditar(false);
                          setTareaId(null);
                          setFormulario({ orden_id: '', descripcion: '', insumos: '', horas: '', costo: '' });
                          setMensaje(null);
                        }}
                      >
                        Cancelar Edición
                      </button>
                    )}
                </div>

              </form>
            </div>
          </div>

          {/* VER TAREAS */}
          <div className="d-grid mt-4 mb-5">
              <button 
                className="btn btn-outline-info opacity-75" 
                onClick={() => setVerTareas(!verTareas)}
              >
                {verTareas ? "Ocultar lista rápida" : "📋 Ver Tareas Registradas Recientemente"}
              </button>
          </div>

          {/* TABLA DESPLEGABLE */}
          {verTareas && (
            <div className="table-responsive rounded-4 shadow-sm bg-dark bg-gradient p-2 border border-secondary border-opacity-25 mb-5">
              <table className="table table-dark table-striped table-hover table-borderless align-middle mb-0">
                <thead className="bg-secondary bg-opacity-10 text-uppercase small">
                  <tr>
                    <th className="py-3 ps-3">ID</th>
                    <th>OT Relacionada</th>
                    <th>Descripción</th>
                    <th>Horas</th>
                    <th>Costo</th>
                    <th className="text-end pe-3">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {tareas.map((tarea) => (
                    <tr key={tarea.id}>
                      <td className="ps-3 fw-bold text-white-50">{tarea.id}</td>
                      <td>
                        <span className="badge bg-primary bg-opacity-25 text-primary border border-primary-subtle rounded-pill">
                            OT #{tarea.orden_id}
                        </span>
                      </td>
                      <td className="text-truncate" style={{maxWidth: '150px'}}>{tarea.descripcion}</td>
                      <td>{tarea.horas}h</td>
                      <td className="text-success">${Number(tarea.costo).toLocaleString()}</td>
                      <td className="text-end pe-3">
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => cargarTareaEnFormulario(tarea.id)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => eliminarTarea(tarea.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default RegistroTarea;