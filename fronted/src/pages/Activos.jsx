import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
            <button className="btn btn-warning btn-sm me-2" onClick={() => alert("Funcionalidad en desarrollo")}>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default Activos;