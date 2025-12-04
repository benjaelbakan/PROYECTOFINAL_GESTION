import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { actualizarOT } from "../services/RF03_OT.service.js"; 

function OTTable({ ots, onEliminar }) {
  const navigate = useNavigate();
  
  // Estados para el Modal de Edición Rápida
  const [showModal, setShowModal] = useState(false);
  const [otEditando, setOtEditando] = useState(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [formRapido, setFormRapido] = useState({
    trabajador_asignado: "",
    estado: ""
  });

  // Abrir el modal con los datos de la fila
  const abrirEdicionRapida = (ot) => {
    setOtEditando(ot);
    setFormRapido({
        trabajador_asignado: ot.trabajador_asignado || "",
        estado: ot.estado || "pendiente"
    });
    setShowModal(true);
  };

  // Cerrar modal y limpiar
  const cerrarModal = () => {
    setShowModal(false);
    setOtEditando(null);
    setLoadingUpdate(false);
  };

  // Guardar cambios rápidos
  const guardarCambiosRapidos = async () => {
    if (!otEditando) return;
    setLoadingUpdate(true);

    try {
        // CORRECCIÓN: Formatear la fecha y limpiar el objeto para evitar errores de backend
        let fechaLimpia = otEditando.fecha_programada;
        if (fechaLimpia && typeof fechaLimpia === 'string' && fechaLimpia.includes('T')) {
            fechaLimpia = fechaLimpia.split('T')[0];
        }

        // Construimos un objeto ESPECÍFICO solo con lo necesario
        // Evitamos enviar campos extra que puedan romper el query UPDATE
        const otActualizada = {
            activo_id: otEditando.activo_id,
            tipo: otEditando.tipo,
            descripcion: otEditando.descripcion,
            fecha_programada: fechaLimpia, // Fecha corregida
            trabajador_asignado: formRapido.trabajador_asignado, // Dato nuevo
            estado: formRapido.estado, // Dato nuevo
            costo: Number(otEditando.costo) || 0 
        };

        console.log("Enviando actualización:", otActualizada); // Para depuración

        await actualizarOT(otEditando.id, otActualizada);
        
        // Cerramos y recargamos
        cerrarModal();
        window.location.reload(); 

    } catch (error) {
        console.error("Error al actualizar:", error);
        alert("Error al guardar los cambios. Revisa la consola para más detalles.");
        setLoadingUpdate(false);
    }
  };

  const getStatusBadge = (estado) => {
    const estadoMin = estado?.toLowerCase() || "";
    if (estadoMin.includes("pendiente")) return "bg-warning text-dark";
    if (estadoMin.includes("en_proceso") || estadoMin.includes("proceso")) return "bg-primary";
    if (estadoMin.includes("terminado") || estadoMin.includes("completado")) return "bg-success";
    if (estadoMin.includes("retrasado")) return "bg-danger";
    return "bg-secondary";
  };

  return (
    <>
      {/* --- TABLA PRINCIPAL --- */}
      <div className="table-responsive rounded-4 shadow-sm bg-dark bg-gradient p-2 border border-secondary border-opacity-25">
        <table className="table table-dark table-striped table-hover table-borderless align-middle mb-0">
          <thead className="bg-secondary bg-opacity-10 text-uppercase small">
            <tr>
              <th className="py-3 ps-3">ID</th>
              <th className="py-3">Activo</th>
              <th className="py-3">Tipo</th>
              <th className="py-3" style={{width: '25%'}}>Descripción</th>
              <th className="py-3">Fecha Prog.</th>
              <th className="py-3">Trabajador</th>
              <th className="py-3">Estado</th>
              <th className="py-3">Costo</th>
              <th className="py-3 text-end pe-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ots.map((ot) => (
              <tr key={ot.id}>
                <td className="ps-3 fw-bold text-white-50">#{ot.id}</td>
                <td>
                  <span className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill">
                    ID: {ot.activo_id}
                  </span>
                </td>
                <td>{ot.tipo}</td>
                <td className="text-truncate" style={{maxWidth: '200px'}} title={ot.descripcion}>
                  {ot.descripcion}
                </td>
                <td>
                  <i className="bi bi-calendar-event me-2 text-secondary"></i>
                  {new Date(ot.fecha_programada).toLocaleDateString()}
                </td>
                
                {/* Columna Trabajador (Clickable) */}
                <td style={{cursor: 'pointer'}} onClick={() => abrirEdicionRapida(ot)} title="Clic para asignar trabajador">
                  {(!ot.trabajador_asignado || ot.trabajador_asignado === "Por asignar") ? (
                      <span className="badge bg-danger bg-opacity-75 text-white">
                          <i className="bi bi-person-exclamation me-1"></i> Asignar
                      </span>
                  ) : (
                      <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-person-check-fill text-success"></i>
                          {ot.trabajador_asignado}
                      </div>
                  )}
                </td>

                {/* Columna Estado (Clickable) */}
                <td style={{cursor: 'pointer'}} onClick={() => abrirEdicionRapida(ot)} title="Clic para cambiar estado">
                  <span className={`badge rounded-pill ${getStatusBadge(ot.estado)}`}>
                    {ot.estado}
                  </span>
                </td>

                <td className="font-monospace text-success fw-bold">
                  ${Number(ot.costo).toLocaleString()}
                </td>
                <td className="text-end pe-3">
                  <div className="d-flex justify-content-end gap-2">
                    {/* Botón de Edición Rápida (Lápiz) */}
                    <button
                      className="btn btn-sm btn-warning bg-gradient d-flex align-items-center justify-content-center shadow-sm"
                      style={{ width: '32px', height: '32px' }}
                      onClick={() => abrirEdicionRapida(ot)}
                      title="Gestión Rápida (Asignar/Estado)"
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    
                    {/* Botón de Edición Completa (Ojo) */}
                    <button
                      className="btn btn-sm btn-outline-info d-flex align-items-center justify-content-center shadow-sm"
                      style={{ width: '32px', height: '32px' }}
                      onClick={() => navigate(`/ordenes_trabajo/editar/${ot.id}`)}
                      title="Ver Detalles Completos"
                    >
                      <i className="bi bi-eye"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-danger bg-gradient d-flex align-items-center justify-content-center shadow-sm"
                      style={{ width: '32px', height: '32px' }}
                      onClick={() => onEliminar(ot.id)}
                      title="Eliminar OT"
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE EDICIÓN RÁPIDA (Corregido Z-Index y Posición) --- */}
      {showModal && (
        <div 
            className="modal fade show d-block" 
            tabIndex="-1" 
            role="dialog"
            style={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                zIndex: 1055, // Asegura que esté por encima de todo
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
            }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content bg-dark border-secondary shadow-lg">
              
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-white">
                    <i className="bi bi-tools me-2 text-warning"></i> 
                    Gestión Rápida - OT #{otEditando?.id}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={cerrarModal}></button>
              </div>
              
              <div className="modal-body p-4">
                <div className="alert alert-secondary bg-opacity-10 border-0 mb-4 text-white-50 small">
                    <i className="bi bi-info-circle me-2"></i>
                    {otEditando?.descripcion}
                </div>
                
                <div className="mb-4">
                    <label className="form-label text-secondary fw-bold small text-uppercase">Trabajador Asignado</label>
                    <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary text-secondary"><i className="bi bi-person"></i></span>
                        <input 
                            type="text" 
                            className="form-control bg-dark text-white border-secondary focus-ring focus-ring-warning"
                            value={formRapido.trabajador_asignado}
                            onChange={(e) => setFormRapido({...formRapido, trabajador_asignado: e.target.value})}
                            placeholder="Nombre del técnico..."
                            autoFocus
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label text-secondary fw-bold small text-uppercase">Estado de la Orden</label>
                    <div className="input-group">
                        <span className="input-group-text bg-dark border-secondary text-secondary"><i className="bi bi-list-task"></i></span>
                        <select 
                            className="form-select bg-dark text-white border-secondary focus-ring focus-ring-warning"
                            value={formRapido.estado}
                            onChange={(e) => setFormRapido({...formRapido, estado: e.target.value})}
                        >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_proceso">En Proceso</option>
                            <option value="completado">Completado</option>
                            <option value="retrasado">Retrasado</option>
                        </select>
                    </div>
                </div>
              </div>
              
              <div className="modal-footer border-secondary">
                <button type="button" className="btn btn-outline-light" onClick={cerrarModal}>
                    Cancelar
                </button>
                <button 
                    type="button" 
                    className="btn btn-warning fw-bold px-4" 
                    onClick={guardarCambiosRapidos}
                    disabled={loadingUpdate}
                >
                    {loadingUpdate ? (
                        <span><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</span>
                    ) : (
                        <span><i className="bi bi-check-lg me-2"></i>Guardar Cambios</span>
                    )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default OTTable;