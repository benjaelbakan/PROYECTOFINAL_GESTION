import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";

import axios from 'axios';

function RegistroTarea() {

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

  // Modo edición
  const [modoEditar, setModoEditar] = useState(false);
  const [tareaId, setTareaId] = useState(null);

  const { id } = useParams();

  // Si viene ID desde la URL, cargar la tarea
  useEffect(() => {
    if (id) {
      cargarTareaEnFormulario(id);
    }
  }, [id]);

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

  // Obtener lista de tareas
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

      // El backend devuelve un objeto, no un array
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

  return (
    <div className="container mt-4">

      <div className="card bg-dark text-white border-secondary shadow">
        <div className="card-header bg-primary">
          <h4 className="mb-0">
            🛠️ {modoEditar ? "Editar Tarea" : "RF04 - Registro de Tarea Realizada"}
          </h4>
        </div>
        
        <div className="card-body">

          {mensaje && <div className={`alert alert-${mensaje.tipo}`}>{mensaje.texto}</div>}

          {/* FORMULARIO */}
          <form onSubmit={modoEditar ? handleActualizar : handleSubmit}>

            <div className="mb-3">
              <label className="form-label">ID Orden de Trabajo (OT)</label>
              <input 
                type="number"
                className="form-control bg-secondary text-white"
                name="orden_id"
                value={formulario.orden_id}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-control bg-secondary text-white"
                name="descripcion"
                rows="3"
                value={formulario.descripcion}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label">Insumos</label>
              <input 
                type="text"
                className="form-control bg-secondary text-white"
                name="insumos"
                value={formulario.insumos}
                onChange={handleChange}
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Horas</label>
                <input 
                  type="number"
                  step="0.5"
                  className="form-control bg-secondary text-white"
                  name="horas"
                  value={formulario.horas}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Costo ($)</label>
                <input 
                  type="number"
                  className="form-control bg-secondary text-white"
                  name="costo"
                  value={formulario.costo}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button className="btn btn-success btn-lg w-100">
              {modoEditar ? "✏️ Guardar Cambios" : "💾 Guardar Tarea"}
            </button>

            {modoEditar && (
              <button
                type="button"
                className="btn btn-secondary w-100 mt-2"
                onClick={() => {
                  setModoEditar(false);
                  setTareaId(null);
                  setFormulario({ orden_id: '', descripcion: '', insumos: '', horas: '', costo: '' });
                }}
              >
                ↩ Cancelar Edición
              </button>
            )}

          </form>

          {/* VER TAREAS */}
          <button className="btn btn-info w-100 mt-3" onClick={cargarTareas}>
            📋 Ver Tareas Registradas
          </button>

          {/* TABLA */}
          {verTareas && (
            <div className="mt-4">
              <h5>Listado de Tareas</h5>

              <table className="table table-dark table-bordered table-striped mt-2">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>OT</th>
                    <th>Descripción</th>
                    <th>Horas</th>
                    <th>Costo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {tareas.map((tarea) => (
                    <tr key={tarea.id}>
                      <td>{tarea.id}</td>
                      <td>{tarea.orden_id}</td>
                      <td>{tarea.descripcion}</td>
                      <td>{tarea.horas}</td>
                      <td>{tarea.costo}</td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => cargarTareaEnFormulario(tarea.id)}
                        >
                          ✏ Editar
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => eliminarTarea(tarea.id)}
                        >
                          🗑 Eliminar
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
