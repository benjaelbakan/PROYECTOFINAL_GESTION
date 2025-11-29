import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- ICONOS SVG ---
const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
  </svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
  </svg>
);

function Activos() {
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // --- ESTADOS DE FILTROS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");      
  const [filterLocation, setFilterLocation] = useState(""); 

  // ordenamiento
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  // paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // modal eliminar
  const [showConfirm, setShowConfirm] = useState(false);
  const [activoAEliminar, setActivoAEliminar] = useState(null);

  const navigate = useNavigate();

  const cargarActivos = () => {
    setLoading(true);
    setErrorMsg("");

    axios
      .get("/api/activos")
      .then((res) => {
        setActivos(res.data);
      })
      .catch((err) => {
        console.error("Error al cargar activos:", err);
        setErrorMsg("No se pudieron cargar los activos.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarActivos();
  }, []);

  // --- KPI: ESTADÍSTICAS RÁPIDAS ---
  const stats = useMemo(() => {
    const total = activos.length;
    const vehiculos = activos.filter(a => a.tipo === "VEHICULO").length;
    const maquinarias = activos.filter(a => a.tipo === "MAQUINARIA").length;
    return { total, vehiculos, maquinarias };
  }, [activos]);

  // --- OBTENER UBICACIONES ÚNICAS ---
  const uniqueLocations = useMemo(() => {
    const locs = activos.map(a => a.ubicacion).filter(Boolean);
    return [...new Set(locs)].sort();
  }, [activos]);

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
  const activosFiltradosYOrdenados = useMemo(() => {
    let data = [...activos];

    if (filterType) {
      data = data.filter((a) => a.tipo === filterType);
    }

    if (filterLocation) {
      data = data.filter((a) => a.ubicacion === filterLocation);
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (a) =>
          a.codigo?.toLowerCase().includes(term) ||
          a.marca?.toLowerCase().includes(term) ||
          a.modelo?.toLowerCase().includes(term) ||
          a.ubicacion?.toLowerCase().includes(term)
      );
    }

    data.sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      const vA = a[sortField];
      const vB = b[sortField];

      if (vA == null && vB == null) return 0;
      if (vA == null) return -1 * dir;
      if (vB == null) return 1 * dir;

      if (typeof vA === "number" && typeof vB === "number") {
        return (vA - vB) * dir;
      }
      return String(vA).localeCompare(String(vB)) * dir;
    });

    return data;
  }, [activos, searchTerm, filterType, filterLocation, sortField, sortOrder]);

  // --- PAGINACIÓN ---
  const totalItems = activosFiltradosYOrdenados.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const activosPagina = activosFiltradosYOrdenados.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterLocation, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortIcon = (field) => {
    if (sortField !== field) return "⇅";
    return sortOrder === "asc" ? "▲" : "▼";
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
  };

  const abrirConfirm = (activo) => {
    setActivoAEliminar(activo);
    setShowConfirm(true);
  };

  const cerrarConfirm = () => {
    setShowConfirm(false);
    setActivoAEliminar(null);
  };

  const confirmarEliminacion = async () => {
    if (!activoAEliminar) return;
    try {
      await axios.delete(`/api/activos/${activoAEliminar.id}`);
      setActivos((prev) => prev.filter((a) => a.id !== activoAEliminar.id));
    } catch (err) {
      console.error("Error al eliminar activo:", err);
      alert("No se pudo eliminar el activo.");
    } finally {
      cerrarConfirm();
    }
  };

  const exportarExcel = () => {
    if (activosFiltradosYOrdenados.length === 0) return alert("No hay datos.");
    const datos = activosFiltradosYOrdenados.map((a) => ({
      ID: a.id,
      "Patente / Serie": a.codigo,
      Tipo: a.tipo,
      Marca: a.marca,
      Modelo: a.modelo,
      Ubicación: a.ubicacion,
    }));
    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Activos");
    XLSX.writeFile(workbook, "activos_biotrans.xlsx");
  };

  const exportarPDF = () => {
    if (activosFiltradosYOrdenados.length === 0) return alert("No hay datos.");
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("BíoTrans Ltda - Activos", 14, 15);
    doc.setFontSize(10);
    doc.text("Listado de flota", 14, 21);
    const head = [["ID", "Patente / Serie", "Tipo", "Marca", "Modelo", "Ubicación"]];
    const body = activosFiltradosYOrdenados.map((a) => [a.id, a.codigo, a.tipo, a.marca, a.modelo, a.ubicacion]);
    autoTable(doc, { startY: 26, head, body, theme: "grid", headStyles: { fillColor: [33, 150, 243] } });
    doc.save("activos_biotrans.pdf");
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12">
        
        {/* --- TARJETAS DE RESUMEN (KPIs) --- */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card bg-dark border-secondary text-white h-100 py-3">
              <div className="card-body d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-white-50 mb-1 text-uppercase small fw-bold">Total Activos</h6>
                  <h2 className="mb-0 fw-bold">{stats.total}</h2>
                </div>
                <div className="opacity-50 display-6">📦</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-dark border-secondary text-white h-100 py-3">
              <div className="card-body d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-white-50 mb-1 text-uppercase small fw-bold">Vehículos</h6>
                  <h2 className="mb-0 fw-bold text-primary">{stats.vehiculos}</h2>
                </div>
                <div className="opacity-50 display-6">🚛</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-dark border-secondary text-white h-100 py-3">
              <div className="card-body d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="text-white-50 mb-1 text-uppercase small fw-bold">Maquinarias</h6>
                  <h2 className="mb-0 fw-bold text-warning">{stats.maquinarias}</h2>
                </div>
                <div className="opacity-50 display-6">🚜</div>
              </div>
            </div>
          </div>
        </div>

        {/* --- TABLA Y FILTROS --- */}
        <div className="card bg-dark border-secondary shadow-sm">
          <div className="card-body">
            
            {/* Cabecera */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
              <h5 className="card-title mb-0 text-light">Inventario de Flota</h5>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-info btn-sm" onClick={exportarExcel}>XLS</button>
                <button className="btn btn-outline-warning btn-sm" onClick={exportarPDF}>PDF</button>
                <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/historial')}>Historial</button>
                <button className="btn btn-success btn-sm" onClick={() => navigate("/activos/nuevo")}>+ Nuevo</button>
              </div>
            </div>

            {/* Filtros */}
            <div className="row g-2 mb-3">
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control form-control-sm text-light bg-dark border-secondary"
                  placeholder="🔍 Buscar patente, marca, modelo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <select 
                  className="form-select form-select-sm bg-dark text-light border-secondary"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">Todos los tipos</option>
                  <option value="VEHICULO">Vehículos</option>
                  <option value="MAQUINARIA">Maquinarias</option>
                </select>
              </div>
              <div className="col-md-4">
                <select 
                  className="form-select form-select-sm bg-dark text-light border-secondary"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                >
                  <option value="">Todas las ubicaciones</option>
                  {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
            </div>

            {/* Tabla */}
            {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}
            {loading ? (
              <p className="text-muted text-center py-4">Cargando inventario...</p>
            ) : totalItems === 0 ? (
              <p className="text-muted text-center py-4">No se encontraron resultados.</p>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-dark table-hover table-sm align-middle mb-0">
                    <thead className="table-secondary text-dark">
                      <tr>
                        <th style={{cursor: "pointer"}} onClick={() => handleSort("id")}>ID {sortIcon("id")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => handleSort("codigo")}>Patente / Serie {sortIcon("codigo")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => handleSort("tipo")}>Tipo {sortIcon("tipo")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => handleSort("marca")}>Marca {sortIcon("marca")}</th>
                        <th style={{cursor: "pointer"}} onClick={() => handleSort("modelo")}>Modelo {sortIcon("modelo")}</th>
                        <th>Ubicación</th>
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activosPagina.map((a) => (
                        <tr key={a.id}>
                          <td className="text-muted small">#{a.id}</td>
                          <td><span className="fw-bold font-monospace text-warning">{a.codigo}</span></td>
                          <td>
                            <span className={`badge ${a.tipo === 'MAQUINARIA' ? 'bg-secondary' : 'bg-primary'} bg-opacity-75`}>
                              {a.tipo === 'VEHICULO' ? 'Vehículo' : 'Maquinaria'}
                            </span>
                          </td>
                          <td>{a.marca}</td>
                          <td>{a.modelo}</td>
                          <td><small className="text-light">{a.ubicacion}</small></td>
                          <td className="text-end">
                            <button className="btn btn-link text-info p-0 me-3" title="Editar" onClick={() => navigate(`/activos/${a.id}/editar`)}>
                              <IconEdit />
                            </button>
                            <button className="btn btn-link text-danger p-0" title="Eliminar" onClick={() => abrirConfirm(a)}>
                              <IconTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary">
                  <span className="small text-muted">Mostrando {startIndex + 1}-{endIndex} de {totalItems}</span>
                  <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-outline-secondary btn-sm" disabled={currentPageSafe === 1} onClick={() => handlePageChange(currentPageSafe - 1)}>« Anterior</button>
                    <button className="btn btn-outline-secondary btn-sm" disabled={currentPageSafe === totalPages} onClick={() => handlePageChange(currentPageSafe + 1)}>Siguiente »</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Confirmación */}
      {showConfirm && activoAEliminar && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">Eliminar Activo</h5>
                <button type="button" className="btn-close btn-close-white" onClick={cerrarConfirm}></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de eliminar <strong>{activoAEliminar.codigo}</strong>?</p>
                <p className="small text-muted mb-0">Esta acción no se puede deshacer.</p>
              </div>
              <div className="modal-footer border-secondary">
                <button type="button" className="btn btn-secondary btn-sm" onClick={cerrarConfirm}>Cancelar</button>
                <button type="button" className="btn btn-danger btn-sm" onClick={confirmarEliminacion}>Sí, eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Activos;