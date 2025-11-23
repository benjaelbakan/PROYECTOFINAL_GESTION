import { useEffect, useState } from "react";
import axios from "axios";

const RF07_KPI = () => {
  const [indicadores, setIndicadores] = useState([]);
  const [mensaje, setMensaje] = useState(null);

  const cargarIndicadores = async () => {
    setMensaje(null);
    try {
      const respuesta = await axios.get("http://localhost:3001/api/RF07_kpi/indicadores");
      const datos = respuesta.data.indicadores;

      if (!datos || datos.length === 0) {
        setMensaje({ tipo: "info", texto: "No hay indicadores disponibles." });
      } else {
        setMensaje(null);
      }

      setIndicadores(datos);
    } catch (error) {
      console.error(error);
      setMensaje({ tipo: "danger", texto: "❌ Error al cargar indicadores." });
    }
  };

  useEffect(() => {
    cargarIndicadores();
  }, []);

  const formatearCosto = (costo) => Number(costo).toFixed(2);
  const formatearMTBF = (mtbf) => (mtbf !== null ? mtbf.toFixed(1) : "-");

  return (
    <div className="container mt-4">
      <div className="card bg-dark text-white border-secondary shadow">
        <div className="card-header bg-primary d-flex justify-content-between align-items-center">
          <h4 className="mb-0">📊 RF07 - Indicadores KPI</h4>
          <button className="btn btn-light btn-sm" onClick={cargarIndicadores}>
            🔄 Actualizar
          </button>
        </div>

        <div className="card-body">
          {mensaje && (
            <div className={`alert alert-${mensaje.tipo}`} role="alert">
              {mensaje.texto}
            </div>
          )}

          {indicadores.length > 0 && (
            <table className="table table-dark table-bordered table-striped mt-2">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Activo</th>
                  <th>Modelo</th>
                  <th>Costo Total ($)</th>
                  <th>Cantidad Intervenciones</th>
                  <th>MTBF (días)</th>
                </tr>
              </thead>
              <tbody>
                {indicadores.map((ind) => (
                  <tr key={ind.id}>
                    <td>{ind.id}</td>
                    <td>{ind.activo}</td>
                    <td>{ind.modelo}</td>
                    <td
                      style={{
                        color: Number(ind.costo_total) > 1000 ? "orange" : "white",
                        fontWeight: Number(ind.costo_total) > 1000 ? "bold" : "normal",
                      }}
                    >
                      {formatearCosto(ind.costo_total)}
                    </td>
                    <td>{ind.cantidad_intervenciones}</td>
                    <td
                      style={{
                        color: ind.mtbf_dias !== null && ind.mtbf_dias < 30 ? "red" : "white",
                        fontWeight: ind.mtbf_dias !== null && ind.mtbf_dias < 30 ? "bold" : "normal",
                      }}
                    >
                      {formatearMTBF(ind.mtbf_dias)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RF07_KPI;
