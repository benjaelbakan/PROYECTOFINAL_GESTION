// fronted/src/pages/Activos.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Activos() {
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  // --- FILTRO + ORDEN ---
  const activosFiltradosYOrdenados = useMemo(() => {
    let data = [...activos];

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (a) =>
          a.codigo?.toLowerCase().includes(term) ||
          a.tipo?.toLowerCase().includes(term) ||
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
  }, [activos, searchTerm, sortField, sortOrder]);

  // --- PAGINACIÓN ---
  const totalItems = activosFiltradosYOrdenados.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const activosPagina = activosFiltradosYOrdenados.slice(
    startIndex,
    endIndex
  );

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
    setCurrentPage(1);
  };

  // --- ELIMINAR ---
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
      setActivos((prev) =>
        prev.filter((a) => a.id !== activoAEliminar.id)
      );
    } catch (err) {
      console.error("Error al eliminar activo:", err);
      alert("No se pudo eliminar el activo.");
    } finally {
      cerrarConfirm();
    }
  };

  // --- EXPORTAR EXCEL ---
  const exportarExcel = () => {
    if (activosFiltradosYOrdenados.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const datos = activosFiltradosYOrdenados.map((a) => ({
      ID: a.id,
      Código: a.codigo,
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

  // --- EXPORTAR PDF ---
  const exportarPDF = () => {
    if (activosFiltradosYOrdenados.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("BíoTrans Ltda - Activos", 14, 15);
    doc.setFontSize(10);
    doc.text("Victor Morales · El partner de tu taller", 14, 21);

    const head = [["ID", "Código", "Tipo", "Marca", "Modelo", "Ubicación"]];
    const body = activosFiltradosYOrdenados.map((a) => [
      a.id,
      a.codigo,
      a.tipo,
      a.marca,
      a.modelo,
      a.ubicacion,
    ]);

    autoTable(doc, {
      startY: 26,
      head,
      body,
      theme: "grid",
      headStyles: { fillColor: [33, 150, 243] },
    });

    doc.save("activos_biotrans.pdf");
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12">
        <div className="card bg-dark border-secondary shadow-sm">
          <div className="card-body">
            {/* Título, exportar, nuevo */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0 text-light">
                Activos registrados
              </h5>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-info btn-sm"
                  type="button"
                  onClick={exportarExcel}
                >
                  Exportar Excel
                </button>

                <button
                  className="btn btn-outline-warning btn-sm"
                  type="button"
                  onClick={exportarPDF}
                >
                  Exportar PDF
                </button>

                {/* 👇 Botón único de historial en la cabecera */}
                <button 
                  className="btn btn-outline-primary me-2"
                  onClick={() => navigate('/historial')} 
                >
                  Ver historial
                </button>

                <button
                  className="btn btn-success btn-sm"
                  onClick={() => navigate("/activos/nuevo")}
                >
                  + Nuevo Activo
                </button>
              </div>
            </div>
            {/* BUSCADOR */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-sm text-light"
                style={{
                  backgroundColor: "#111827",
                  borderColor: "#374151",
                }}
                placeholder="Buscar por código, tipo, marca, modelo o ubicación..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {errorMsg && (
              <div className="alert alert-danger py-2">{errorMsg}</div>
            )}

            {loading ? (
              <p className="text-muted mb-0">Cargando activos...</p>
            ) : totalItems === 0 ? (
              <p className="text-muted mb-0">No hay activos registrados.</p>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-dark table-hover table-sm align-middle mb-0">
                    <thead>
                      <tr>
                        <th
                          style={{ cursor: "pointer" }}
                          onClick={() => handleSort("id")}
                        >
                          ID <span className="small">{sortIcon("id")}</span>
                        </th>
                        <th
                          style={{ cursor: "pointer" }}
                          onClick={() => handleSort("codigo")}
                        >
                          Código{" "}
                          <span className="small">{sortIcon("codigo")}</span>
                        </th>
                        <th
                          style={{ cursor: "pointer" }}
                          onClick={() => handleSort("tipo")}
                        >
                          Tipo{" "}
                          <span className="small">{sortIcon("tipo")}</span>
                        </th>
                        <th
                          style={{ cursor: "pointer" }}
                          onClick={() => handleSort("marca")}
                        >
                          Marca{" "}
                          <span className="small">{sortIcon("marca")}</span>
                        </th>
                        <th
                          style={{ cursor: "pointer" }}
                          onClick={() => handleSort("modelo")}
                        >
                          Modelo{" "}
                          <span className="small">{sortIcon("modelo")}</span>
                        </th>
                        <th>Ubicación</th>
                        <th style={{ width: 190 }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activosPagina.map((a) => (
                        <tr key={a.id}>
                          <td>{a.id}</td>
                          <td>{a.codigo}</td>
                          <td>{a.tipo}</td>
                          <td>{a.marca}</td>
                          <td>{a.modelo}</td>
                          <td>{a.ubicacion}</td>
                          <td>
                            <button
                              className="btn btn-outline-light btn-sm me-2"
                              onClick={() =>
                                navigate(`/activos/${a.id}/editar`)
                              }
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => abrirConfirm(a)}
                            >
                              Eliminar
                            </button>
                           

                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <p className="small text-muted mb-0">
                    Mostrando {startIndex + 1}-{endIndex} de {totalItems}{" "}
                    registros
                  </p>

                  <div className="d-flex align-items-center gap-2">
                    <label className="small text-muted me-1 mb-0">
                      Filas por página:
                    </label>
                    <select
                      className="form-select form-select-sm bg-dark text-light border-secondary"
                      value={pageSize}
                      onChange={handlePageSizeChange}
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>

                    <button
                      className="btn btn-outline-light btn-sm"
                      disabled={currentPageSafe === 1}
                      onClick={() =>
                        handlePageChange(currentPageSafe - 1)
                      }
                    >
                      «
                    </button>

                    <span className="small text-muted">
                      Página {currentPageSafe} de {totalPages}
                    </span>

                    <button
                      className="btn btn-outline-light btn-sm"
                      disabled={currentPageSafe === totalPages}
                      onClick={() =>
                        handlePageChange(currentPageSafe + 1)
                      }
                    >
                      »
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Modal de confirmación */}
            {showConfirm && activoAEliminar && (
              <div
                className="modal fade show"
                style={{
                  display: "block",
                  backgroundColor: "rgba(0,0,0,0.6)",
                }}
              >
                <div className="modal-dialog">
                  <div className="modal-content bg-dark text-light border-secondary">
                    <div className="modal-header border-secondary">
                      <h5 className="modal-title">
                        Confirmar eliminación
                      </h5>
                      <button
                        type="button"
                        className="btn-close btn-close-white"
                        onClick={cerrarConfirm}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <p className="mb-1">
                        ¿Seguro que quieres eliminar el activo{" "}
                        <strong>{activoAEliminar.codigo}</strong> (
                        {activoAEliminar.marca}{" "}
                        {activoAEliminar.modelo})?
                      </p>
                      <p
                        className="small"
                        style={{ color: "rgba(255,255,255,0.75)" }}
                      >
                        Esta acción no se puede deshacer.
                      </p>
                    </div>
                    <div className="modal-footer border-secondary">
                      <button
                        type="button"
                        className="btn btn-outline-light btn-sm"
                        onClick={cerrarConfirm}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={confirmarEliminacion}
                      >
                        Eliminar definitivamente
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Activos;
