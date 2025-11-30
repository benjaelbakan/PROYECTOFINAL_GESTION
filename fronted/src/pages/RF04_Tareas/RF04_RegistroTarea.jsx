import { useState } from 'react';
import axios from 'axios';

function RegistroTarea() {

  const [formulario, setFormulario] = useState({
    orden_id: '',
    descripcion: '',
    insumos: '',
    horas: 0,
    costo: 0
  });

  const [mensaje, setMensaje] = useState(null);
  const [tareas, setTareas] = useState([]); // 👈 Lista de tareas desde backend
  const [verTareas, setVerTareas] = useState(false); // 👈 Para mostrar/ocultar tabla

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);

    try {
      const respuesta = await axios.post('http://localhost:3001/api/RF04_tareas', formulario);
      
      setMensaje({ tipo: 'success', texto: '✅ Tarea registrada correctamente ID: ' + respuesta.data.id });

      setFormulario({ orden_id: '', descripcion: '', insumos: '', horas: 0, costo: 0 });

    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'danger', texto: '❌ Error al registrar. Revisa que el Backend esté encendido.' });
    }
  };

  // 👇 FUNCIÓN PARA OBTENER LISTADO DE TAREAS
  const cargarTareas = async () => {
    try {
      const respuesta = await axios.get('http://localhost:3001/api/RF04_tareas');
      setTareas(respuesta.data);
      setVerTareas(true);
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: 'danger', texto: '❌ No se pudieron cargar las tareas.' });
    }
  };

  return (
    <div className="container mt-4">
      <div className="card bg-dark text-white border-secondary shadow">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">🛠️ RF04 - Registro de Tarea Realizada</h4>
        </div>
        
        <div className="card-body">
          {mensaje && (
            <div className={`alert alert-${mensaje.tipo}`} role="alert">
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="mb-3">
              <label className="form-label">ID Orden de Trabajo (OT)</label>
              <input 
                type="number"
                className="form-control bg-secondary text-white border-0"
                name="orden_id"
                value={formulario.orden_id}
                onChange={handleChange}
                required
                placeholder="Ej: 1"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Descripción del Trabajo</label>
              <textarea 
                className="form-control bg-secondary text-white border-0" 
                rows="3"
                name="descripcion"
                value={formulario.descripcion}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="mb-3">
              <label className="form-label">Insumos/Repuestos Utilizados</label>
              <input 
                type="text" 
                className="form-control bg-secondary text-white border-0"
                name="insumos"
                value={formulario.insumos}
                onChange={handleChange}
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Horas Hombre</label>
                <input 
                  type="number"
                  step="0.5"
                  className="form-control bg-secondary text-white border-0"
                  name="horas"
                  value={formulario.horas}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Costo Asociado ($)</label>
                <input 
                  type="number"
                  className="form-control bg-secondary text-white border-0"
                  name="costo"
                  value={formulario.costo}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="d-grid gap-2 mb-3">
              <button type="submit" className="btn btn-success btn-lg">
                💾 Guardar Tarea
              </button>
            </div>

          </form>

          {/* 🔽 BOTÓN PARA MOSTRAR TAREAS */}
          <div className="d-grid gap-2">
            <button 
              className="btn btn-info"
              onClick={cargarTareas}
            >
              📋 Ver Tareas Registradas
            </button>
          </div>

          {/* 🔽 TABLA DE TAREAS */}
          {verTareas && (
            <div className="mt-4">
              <h5 className="text-light">Listado de Tareas Registradas</h5>
              
              <table className="table table-dark table-bordered table-striped mt-2">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>OT</th>
                    <th>Descripción</th>
                    <th>Horas</th>
                    <th>Costo ($)</th>
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
