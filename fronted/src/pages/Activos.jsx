// fronted/src/pages/Activos.jsx
import { useEffect, useState } from "react";
import { useNavigate  } from "react-router-dom";
import axios from "axios";

function Activos() {
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
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

  const eliminarActivo = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres eliminar este activo?"
    );
    if (!confirmar) return;

    try {
      await axios.delete(`/api/activos/${id}`);
      setActivos((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error al eliminar activo:", err);
      alert("No se pudo eliminar el activo.");
    }
  };

    function HeaderActivos() {
    return (
      <div className="encabezado">
        {/* pestañas o botones */}
        <div style={{ display: "flex", gap: "8px" }}>
          <Link to="/">
            <button>Activos</button>
          </Link>

          
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12">
        <div className="card bg-dark border-secondary shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">Activos registrados</h5>
              <button
                className="btn btn-success btn-sm"
                onClick={() => navigate("/activos/nuevo")}
              >
                + Nuevo Activo
              </button>

              
            </div>
              
            {errorMsg && (
              <div className="alert alert-danger py-2">{errorMsg}</div>
            )}

            {loading ? (
              <p className="text-muted mb-0">Cargando activos...</p>
            ) : activos.length === 0 ? (
              <p className="text-muted mb-0">No hay activos registrados.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-hover table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Código</th>
                      <th>Tipo</th>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th>Ubicación</th>
                      <th style={{ width: 190 }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activos.map((a) => (
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
                            onClick={() => navigate(`/activos/${a.id}/editar`)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => eliminarActivo(a.id)}
                          >
                            Eliminar
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
    </div>
  );
}

export default Activos;
