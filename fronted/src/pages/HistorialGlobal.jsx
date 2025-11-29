import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MESES = [
  { value: "1", label: "Enero" }, { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" }, { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" }, { value: "6", label: "Junio" },
  { value: "7", label: "Julio" }, { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" }, { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" }, { value: "12", label: "Diciembre" },
];

function HistorialGlobal() {
  const navigate = useNavigate();

  // Estados de Datos
  const [activos, setActivos] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Estados de Filtros
  const [activoId, setActivoId] = useState("");
  const [anio, setAnio] = useState("");
  const [mes, setMes] = useState("");
  const [tipo, setTipo] = useState("");

  // Estados de Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Años disponibles
  const currentYear = new Date().getFullYear();
  const aniosDisponibles = Array.from({ length: 8 }, (_, i) => currentYear - 3 + i);

  // 1. Cargar activos (para el filtro)
  useEffect(() => {
    fetch("/api/activos")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setActivos(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error activos:", err));
  }, []);

  // 2. Cargar Historial
  const cargarHistorial = async () => {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (anio) params.append("anio", anio);
      if (mes) params.append("mes", mes);
      if (tipo && tipo !== "todos") params.append("tipo", tipo);

      const url = activoId
        ? `/api/activos/${activoId}/historial?${params.toString()}`
        : `/api/historial?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al cargar datos");
      
      const data = await res.json();
      setRegistros(Array.isArray(data) ? data : []);
      setCurrentPage(1); // Resetear a página 1 al filtrar
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el historial.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activoId, anio, mes, tipo]);

  // --- LÓGICA DE PAGINACIÓN ---
  const totalItems = registros.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const registrosPagina = registros.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  // --- LIMPIAR FILTROS ---
  const limpiarFiltros = () => {
    setActivoId("");
    setAnio("");
    setMes("");
    setTipo("");
  };

  // --- EXPORTAR CSV (Nativo, sin librerías) ---
  const exportarCSV = () => {
    if (registros.length === 0) return alert("No hay datos para exportar.");
    
    // Encabezados
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Fecha,Vehiculo,Tipo,Descripcion,OT_ID\n";

    // Filas
    registros.forEach((r) => {
      const fecha = new Date(r.fecha).toLocaleDateString("es-CL");
      const vehiculo = r.marca ? `${r.codigo} - ${r.marca} ${r.modelo}` : `Activo ${r.activo_id}`;
      // Limpiamos la descripción de comas para no romper el CSV
      const descripcion = r.descripcion.replace(/,/g, " "); 
      
      const row = `${fecha},${vehiculo},${r.tipo},${descripcion},${r.ot_id}`;
      csvContent += row + "\n";
    });

    // Descarga
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historial_mantenimiento.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- IMPRIMIR / PDF (Nativo) ---
  const imprimirReporte = () => {
    window.print();
  };

  return (
    <div className="container mt-4">
      {/* CABECERA Y BOTONES */}
      <div className="d-flex justify-content-between align-items-center mb-4 no-print">
        <h2 className="mb-0">Historial de Mantenimiento</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-info btn-sm" onClick={exportarCSV}>
            Descargar CSV
          </button>
          <button className="btn btn-outline-warning btn-sm" onClick={imprimirReporte}>
            Imprimir / PDF
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>

      {/* PANEL DE FILTROS (Oculto al imprimir) */}
      <div className="card bg-dark text-white border-secondary mb-4 shadow-sm no-print">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label text-white-50 small">Filtrar por Vehículo</label>
              <select 
                className="form-select bg-secondary text-white border-0"
                value={activoId} 
                onChange={(e) => setActivoId(e.target.value)}
              >
                <option value="">-- Ver Todos --</option>
                {activos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.codigo} - {a.marca} {a.modelo}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label text-white-50 small">Año</label>
              <select className="form-select bg-secondary text-white border-0" value={anio} onChange={(e) => setAnio(e.target.value)}>
                <option value="">Todos</option>
                {aniosDisponibles.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label text-white-50 small">Mes</label>
              <select className="form-select bg-secondary text-white border-0" value={mes} onChange={(e) => setMes(e.target.value)}>
                <option value="">Todos</option>
                {MESES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label text-white-50 small">Tipo</label>
              <select className="form-select bg-secondary text-white border-0" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="">Todos</option>
                <option value="preventiva">Preventiva</option>
                <option value="correctiva">Correctiva</option>
              </select>
            </div>

            <div className="col-md-2">
              <button className="btn btn-outline-light w-100" onClick={limpiarFiltros}>
                Limpiar ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ESTILOS PARA IMPRESIÓN */}
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            body, .card, .table { background-color: white !important; color: black !important; }
            .table-dark { color: black !important; background-color: white !important; }
            .table-dark th, .table-dark td { border-color: #ddd !important; }
            .badge { border: 1px solid #000; color: black !important; }
          }
        `}
      </style>

      {/* TABLA */}
      {error && <div className="alert alert-danger">{error}</div>}
      {cargando ? (
        <div className="text-center py-5 text-muted">Cargando historial...</div>
      ) : registros.length === 0 ? (
        <div className="alert alert-info text-center">No se encontraron registros con estos filtros.</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead className="table-secondary text-dark">
                <tr>
                  <th>Fecha</th>
                  <th>Vehículo / Activo</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>OT ID</th>
                </tr>
              </thead>
              <tbody>
                {registrosPagina.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.fecha).toLocaleDateString("es-CL", { timeZone: 'UTC' })}</td>
                    <td>
                      {r.marca ? (
                        <>
                          <span className="fw-bold text-warning">{r.codigo}</span>
                          <div className="small text-white-50">{r.marca} {r.modelo}</div>
                        </>
                      ) : (
                        <span className="text-white-50">Activo #{r.activo_id}</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${r.tipo === 'correctiva' ? 'bg-danger' : 'bg-info text-dark'}`}>
                        {r.tipo}
                      </span>
                    </td>
                    <td className="text-white-50 small">{r.descripcion}</td>
                    <td>
                      <span className="badge bg-secondary">#{r.ot_id}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN (Oculta al imprimir) */}
          <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary no-print">
            <span className="text-white-50 small">Mostrando {startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)} de {totalItems}</span>
            
            <div className="d-flex gap-2 align-items-center">
              <select 
                className="form-select form-select-sm bg-dark text-white border-secondary" 
                style={{width: '70px'}}
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>

              <button 
                className="btn btn-outline-secondary btn-sm" 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                «
              </button>
              <span className="text-white small">Página {currentPage}</span>
              <button 
                className="btn btn-outline-secondary btn-sm" 
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                »
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default HistorialGlobal;