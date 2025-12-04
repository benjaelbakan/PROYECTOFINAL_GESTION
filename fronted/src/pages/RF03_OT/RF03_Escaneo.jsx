import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EscanerMovil = () => {
  const [resultado, setResultado] = useState(null);
  const [descripcionFalla, setDescripcionFalla] = useState("");
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (resultado) return;

    const scanner = new Html5QrcodeScanner(
      "reader", 
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      false
    );

    function onScanSuccess(decodedText) {
      scanner.clear().catch(console.error);
      const codigoLimpio = decodedText.trim(); 
      verificarEnBackend(codigoLimpio);
    }

    scanner.render(onScanSuccess, (err) => { /* ignorar errores de frame */ });

    return () => {
      scanner.clear().catch(err => console.error("Limpieza scanner", err));
    };
  }, [resultado]);

  const verificarEnBackend = async (codigo) => {
    try {
        const res = await axios.get("http://localhost:3001/api/activos");
        const activoEncontrado = res.data.find(a => a.codigo === codigo);

        if (activoEncontrado) {
            setResultado({
                patente: codigo,
                existe: true,
                id: activoEncontrado.id,
                info: `${activoEncontrado.marca} ${activoEncontrado.modelo}`,
                imagen: "bi-check-circle-fill text-success"
            });
        } else {
            setResultado({
                patente: codigo,
                existe: false,
                info: "Activo No Registrado",
                imagen: "bi-exclamation-triangle-fill text-warning"
            });
        }

    } catch (error) {
        console.error(error);
        alert("Error al verificar el código. Intente nuevamente.");
        window.location.reload();
    }
  };

  const enviarReporteOT = async () => {
    if(!descripcionFalla.trim()) return alert("Por favor describe el problema.");
    
    setEnviando(true);
    try {
        // ✅ CORRECCIÓN: Usamos la ruta específica '/ordenes/orden_trabajo'
        // que es la que tu backend reconoce para crear registros.
        await axios.post('http://localhost:3001/api/ordenes/orden_trabajo', {
            activo_id: resultado.id,
            tipo: 'Correctivo',
            descripcion: `[REPORTE QR] ${descripcionFalla}`,
            fecha_programada: new Date().toISOString().split('T')[0],
            trabajador_asignado: "Por asignar",
            estado: "pendiente",
            costo: 0
        });

        alert("✅ Reporte enviado exitosamente. Se ha creado una OT.");
        window.location.reload(); 
    } catch (error) {
        console.error("Error al enviar reporte:", error);
        alert("Error al enviar el reporte. Verifica la conexión con el servidor.");
    } finally {
        setEnviando(false);
    }
  };

  const irACrearActivo = () => {
    navigate('/activos/nuevo', { 
        state: { 
            activo: { codigo: resultado.patente } 
        } 
    });
  };

  return (
    <div className="container mt-4">
      
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate('/home')}>
        <i className="bi bi-arrow-left me-2"></i> Volver
      </button>

      <div className="card bg-dark border-secondary text-white shadow-lg rounded-4 overflow-hidden">
        <div className="card-header bg-transparent border-bottom border-secondary text-center p-3">
          <h4 className="mb-0 text-white">
            <i className="bi bi-qr-code-scan me-2 text-primary"></i> 
            Escáner Móvil
          </h4>
        </div>

        <div className="card-body p-4 text-center">
          
          {!resultado && (
             <div className="d-flex flex-column align-items-center">
                <div id="reader" style={{ width: '100%', maxWidth: '400px', borderRadius: '15px', overflow: 'hidden' }}></div>
                <p className="text-secondary mt-3 small">Enfoque el código QR del activo.</p>
             </div>
          )}

          {resultado && (
            <div className="animate__animated animate__fadeInUp">
              
              <div className="mb-4">
                <i className={`bi ${resultado.imagen} display-1 mb-3`}></i>
                <h2 className="fw-bold">{resultado.patente}</h2>
                <span className={`badge ${resultado.existe ? 'bg-success' : 'bg-warning text-dark'} fs-6 px-3 py-2 rounded-pill`}>
                    {resultado.info}
                </span>
              </div>

              {resultado.existe ? (
                <div className="bg-secondary bg-opacity-10 p-3 rounded-3 border border-secondary text-start">
                    <label className="form-label text-warning fw-bold small text-uppercase">
                        <i className="bi bi-tools me-1"></i> Reportar Problema / Solicitar OT
                    </label>
                    <textarea 
                        className="form-control bg-dark text-white border-secondary mb-3" 
                        rows="3" 
                        placeholder="Describe la falla, ruido o avería encontrada..."
                        value={descripcionFalla}
                        onChange={(e) => setDescripcionFalla(e.target.value)}
                    ></textarea>
                    
                    <button 
                        className="btn btn-danger w-100 py-2 fw-bold shadow-sm"
                        onClick={enviarReporteOT}
                        disabled={enviando}
                    >
                        {enviando ? "Enviando..." : "🚨 Enviar Reporte de Falla"}
                    </button>
                </div>
              ) : (
                <div className="bg-secondary bg-opacity-10 p-4 rounded-3 border border-secondary">
                    <p className="text-white-50 mb-4">
                        Este código no está asociado a ningún activo en la base de datos.
                    </p>
                    <button 
                        className="btn btn-warning btn-lg w-100 fw-bold shadow-sm text-dark"
                        onClick={irACrearActivo}
                    >
                        <i className="bi bi-plus-circle-dotted me-2"></i>
                        Registrar Nuevo Activo
                    </button>
                </div>
              )}

              <button className="btn btn-link text-secondary mt-4 text-decoration-none" onClick={() => window.location.reload()}>
                <i className="bi bi-arrow-clockwise me-1"></i> Escanear otro código
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EscanerMovil;