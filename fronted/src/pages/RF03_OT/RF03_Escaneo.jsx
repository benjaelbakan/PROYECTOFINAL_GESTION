import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from 'react-router-dom';

const EscanerMovil = () => {
  const [resultado, setResultado] = useState(null);
  const [modoReporte, setModoReporte] = useState(false); // Nuevo estado para mostrar formulario
  const [descripcionFalla, setDescripcionFalla] = useState("");
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
      const codigoLimpio = decodedText.trim().toUpperCase();
      verificarEnBackend(codigoLimpio);
    }

    scanner.render(onScanSuccess, () => {});

    return () => {
      scanner.clear().catch(err => console.error("Limpieza", err));
    };
  }, [resultado]);

  const verificarEnBackend = async (codigo) => {
    try {
        const response = await fetch('/api/escaner/verificar-patente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patente: codigo })
        });
        const data = await response.json();

        setResultado({
            patente: codigo,
            existe: data.existe,
            id: data.id || null,
            info: data.existe ? `${data.marca} ${data.modelo}` : "Activo No Registrado"
        });
    } catch (error) {
        alert("Error de conexión");
        window.location.reload();
    }
  };

  // --- NUEVA FUNCIÓN: ENVIAR SOLICITUD DE OT ---
  const enviarSolicitud = async () => {
    if(!descripcionFalla.trim()) return alert("Describe el problema primero");

    try {
        const response = await fetch('/api/ot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                activoId: resultado.id,
                tipo: 'CORRECTIVO', // Asumimos que si reportan desde el celular es una falla
                descripcion: `[SOLICITUD WEB] ${descripcionFalla}`, // Marca para que el jefe sepa
                fechaProgramada: null, // Queda pendiente
                trabajadorAsignado: null // Queda pendiente
            })
        });

        if(response.ok){
            alert("✅ Solicitud enviada exitosamente al taller.");
            window.location.reload(); // Reiniciar para escanear otro
        } else {
            alert("Error al enviar solicitud");
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión");
    }
  };

  return (
    <div className="container mt-3">
      <div className="card bg-dark border-secondary text-light shadow-lg">
        <div className="card-body text-center p-3">
          
          <h3 className="mb-3 text-warning">📲 Escáner QR</h3>

          {!resultado && (
             <div className="overflow-hidden rounded border border-primary">
                <div id="reader" style={{ width: '100%' }}></div>
                <p className="small text-muted mt-2">Apunta al código QR</p>
             </div>
          )}

          {resultado && (
            <div className="animate__animated animate__fadeIn mt-3">
              <div className="alert alert-dark border-secondary">
                <h1 className="display-4 fw-bold text-white mb-0">{resultado.patente}</h1>
                <p className={resultado.existe ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                    {resultado.info}
                </p>
              </div>
              
              {resultado.existe ? (
                // --- SI EL ACTIVO EXISTE ---
                modoReporte ? (
                    // FORMULARIO DE REPORTE (Aparece al hacer clic en Reportar)
                    <div className="text-start bg-secondary bg-opacity-25 p-3 rounded">
                        <label className="form-label text-warning fw-bold">Describe la falla o solicitud:</label>
                        <textarea 
                            className="form-control mb-3" 
                            rows="3" 
                            placeholder="Ej: Ruido en frenos, luz trasera rota..."
                            value={descripcionFalla}
                            onChange={(e) => setDescripcionFalla(e.target.value)}
                        ></textarea>
                        <div className="d-grid gap-2">
                            <button className="btn btn-primary btn-lg" onClick={enviarSolicitud}>🚀 Enviar Solicitud</button>
                            <button className="btn btn-outline-light" onClick={() => setModoReporte(false)}>Cancelar</button>
                        </div>
                    </div>
                ) : (
                    // BOTONES PRINCIPALES
                    <div className="d-grid gap-3 mt-4">
                        <button 
                            className="btn btn-danger btn-lg py-3 fw-bold shadow" 
                            onClick={() => setModoReporte(true)}
                        >
                            ⚠️ Reportar Falla / Solicitar OT
                        </button>

                        <button 
                            className="btn btn-success py-2" 
                            onClick={() => navigate(`/activos/${resultado.id}/historial`)}
                        >
                            📂 Ver Historial
                        </button>
                    </div>
                )
              ) : (
                // --- SI EL ACTIVO NO EXISTE ---
                <div className="d-grid gap-3 mt-4">
                    <button className="btn btn-warning btn-lg py-3 text-dark fw-bold" onClick={() => navigate(`/activos/nuevo?patente=${resultado.patente}`)}>
                        ➕ Registrar Nuevo Activo
                    </button>
                </div>
              )}
              
              {!modoReporte && (
                  <button className="btn btn-outline-light mt-3" onClick={() => window.location.reload()}>
                      🔄 Escanear otro
                  </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EscanerMovil;