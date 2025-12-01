import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import emailjs from '@emailjs/browser';
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

function Activos() {
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);        // ← AQUÍ ESTABA EL ERROR
  const [showConfirm, setShowConfirm] = useState(false);
  const [activoAEliminar, setActivoAEliminar] = useState(null);
  const [alertaMsg, setAlertaMsg] = useState(null);

  const navigate = useNavigate();

  const sendAlertsViaEmailJS = async () => {
    setAlertaMsg(null);
    try {
      const res = await axios.get('/api/alertas/proximas');
      if (!res.data || !res.data.ok) {
        setAlertaMsg({ tipo: 'danger', texto: 'No se pudieron obtener alertas' });
        return;
      }
      const { alertas, suscriptores } = res.data;
      if (!alertas || alertas.length === 0) {
        setAlertaMsg({ tipo: 'info', texto: 'No hay mantenimientos próximos' });
        return;
      }

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      if (!serviceId || !templateId || !publicKey) {
        setAlertaMsg({ tipo: 'danger', texto: 'Faltan variables VITE_EMAILJS_* en fronted/.env.local' });
        return;
      }

      let success = 0;
      let fail = 0;

      // Prepare html content (shared template). Use company env vars when available.
      const makeHtml = (alertasList) => {
        const items = alertasList.map(a => `<li><strong>${a.activo}</strong>: ${a.mensaje} (${new Date(a.fecha_programada).toLocaleDateString()})</li>`).join('');
        const logoUrl = import.meta.env.VITE_COMPANY_LOGO_URL || 'https://placehold.co/150x32?text=Victor+Morales';
        const companyPhone = import.meta.env.VITE_COMPANY_PHONE || '+56 9 1234 5678';
        const companyEmail = import.meta.env.VITE_COMPANY_EMAIL || 'soporte@gestiona.local';
        const website = import.meta.env.VITE_COMPANY_WEBSITE || '#';
        return `
<div style="font-family: system-ui, sans-serif, Arial; font-size: 14px; color: #212121">
  <div style="max-width: 600px; margin: auto">
    <div style="text-align: center; background-color: #ffc002; padding: 32px 16px; border-radius: 32px 32px 0 0;">
      <a style="text-decoration: none; outline: none" href="${website}" target="_blank">
        <img style="height: 32px; vertical-align: middle" height="32" src="${logoUrl}" alt="logo" />
      </a>
    </div>
    <div style="padding: 16px">
      <h1 style="font-size: 26px; margin-bottom: 26px">Mantenimientos próximos</h1>
      <p>Estimado suscriptor,</p>
      <p>A continuación se listan los mantenimientos próximos que requieren atención:</p>
      <ul>${items}</ul>
      <p>Por favor coordina con el equipo de mantenimiento si necesitas cambiar fechas o reagendar.</p>
    </div>
    <div style="text-align: center; background-color: #ffc002; padding: 16px; border-radius: 0 0 32px 32px;">
      <p>Contacto: <strong><a href="mailto:${companyEmail}" style="text-decoration:none; color:#212121">${companyEmail}</a></strong></p>
      <p>Tel: <strong><a href="tel:${companyPhone}" style="text-decoration:none; color:#212121">${companyPhone}</a></strong></p>
    </div>
  </div>
</div>
        `;
      };

      // Send to each subscriber sequentially (to avoid rate-limit bursts)
      for (const mail of suscriptores) {
        const templateParams = {
          to_email: mail,
          email: mail,
          subject: `Mantenimientos próximos - ${new Date().toLocaleDateString()}`,
          html: makeHtml(alertas)
        };
        try {
          // eslint-disable-next-line no-await-in-loop
          await emailjs.send(serviceId, templateId, templateParams, publicKey);
          success += 1;
        } catch (e) {
          console.error('Error enviando a', mail, e);
          fail += 1;
        }
        // small pause to be polite with provider
        // eslint-disable-next-line no-await-in-loop
        await new Promise(r => setTimeout(r, 200));
      }

      setAlertaMsg({ tipo: 'success', texto: `Correos enviados: ${success}. Fallidos: ${fail}` });
    } catch (err) {
      console.error(err);
      setAlertaMsg({ tipo: 'danger', texto: err.message || 'Error al verificar alertas' });
    }
  };

  useEffect(() => {
    axios.get("/api/activos")
      .then(res => {
        setActivos(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setAlertaMsg({ tipo: "danger", texto: "Error al cargar activos" });
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let data = [...(activos || [])];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(a =>
        a.codigo?.toLowerCase().includes(term) ||
        a.tipo?.toLowerCase().includes(term) ||
        a.marca?.toLowerCase().includes(term) ||
        a.modelo?.toLowerCase().includes(term) ||
        a.ubicacion?.toLowerCase().includes(term)
      );
    }

    data.sort((a, b) => {
      const A = (a[sortField] || "").toString();
      const B = (b[sortField] || "").toString();
      return sortOrder === "asc" ? A.localeCompare(B) : B.localeCompare(A);
    });

    return data;
  }, [activos, searchTerm, sortField, sortOrder]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map(a => ({
      ID: a.id, Código: a.codigo, Tipo: a.tipo, Marca: a.marca, Modelo: a.modelo, Ubicación: a.ubicacion
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Activos");
    XLSX.writeFile(wb, "activos_biotrans.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("BíoTrans Ltda - Listado de Activos", 14, 15);
    if (doc.autoTable) {
      doc.autoTable({
        head: [["ID", "Código", "Tipo", "Marca", "Modelo", "Ubicación"]],
        body: filtered.map(a => [a.id, a.codigo, a.tipo, a.marca, a.modelo, a.ubicacion]),
        startY: 25,
      });
    }
    doc.save("activos_biotrans.pdf");
  };

  const eliminar = async () => {
    if (!activoAEliminar?.id) return;
    try {
      await axios.delete(`/api/activos/${activoAEliminar.id}`);
      setActivos(prev => prev.filter(a => a.id !== activoAEliminar.id));
      setAlertaMsg({ tipo: "success", texto: "Activo eliminado" });
    } catch {
      setAlertaMsg({ tipo: "danger", texto: "Error al eliminar" });
    } finally {
      setShowConfirm(false);
      setActivoAEliminar(null);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Activos Registrados</h4>
          <div>
            <button className="btn btn-warning btn-sm me-2" onClick={() => { if (confirm('Enviar alertas a los suscriptores ahora?')) sendAlertsViaEmailJS(); }}>
              Verificar Alertas
            </button>
            <button className="btn btn-success btn-sm me-2" onClick={exportExcel}>Excel</button>
            <button className="btn btn-danger btn-sm me-2" onClick={exportPDF}>PDF</button>
            <button className="btn btn-light" onClick={() => navigate("/activos/nuevo")}>
              + Nuevo Activo
            </button>
          </div>
        </div>

        <div className="card-body">
          {alertaMsg && (
            <div className={`alert alert-${alertaMsg.tipo} alert-dismissible`}>
              {alertaMsg.texto}
              <button className="btn-close" onClick={() => setAlertaMsg(null)}></button>
            </div>
          )}

          <input
            type="text"
            className="form-control mb-3"
            placeholder="Buscar activo..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />

          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th onClick={() => handleSort("id")} style={{cursor: "pointer"}}>ID</th>
                  <th onClick={() => handleSort("codigo")} style={{cursor: "pointer"}}>Código</th>
                  <th onClick={() => handleSort("tipo")} style={{cursor: "pointer"}}>Tipo</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Ubicación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(a => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td><strong>{a.codigo}</strong></td>
                    <td><span className={`badge ${a.tipo === "VEHICULO" ? "bg-primary" : "bg-warning text-dark"}`}>{a.tipo}</span></td>
                    <td>{a.marca}</td>
                    <td>{a.modelo}</td>
                    <td>{a.ubicacion}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => navigate(`/activos/${a.id}/editar`)}>
                        Editar
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => { setActivoAEliminar(a); setShowConfirm(true); }}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <div>Página {currentPage} de {totalPages || 1}</div>
            <div>
              <button className="btn btn-sm btn-secondary me-2" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Anterior</button>
              <button className="btn btn-sm btn-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Siguiente</button>
            </div>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="modal show d-block" style={{background: "rgba(0,0,0,0.5)"}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5>Confirmar eliminación</h5>
                <button className="btn-close btn-close-white" onClick={() => setShowConfirm(false)}></button>
              </div>
              <div className="modal-body">
                ¿Seguro que quieres eliminar el activo <strong>{activoAEliminar?.codigo}</strong>?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancelar</button>
                <button className="btn btn-danger" onClick={eliminar}>Eliminar</button>
              </div>
            </div>
          </div>          git push origin RF05
        </div>
      )}
    </div>
  );
}

export default Activos;