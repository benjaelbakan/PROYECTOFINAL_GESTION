import React, { useEffect, useState } from 'react';
import axios from 'axios';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardGeneral() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [kpis, setKpis] = useState({
    otsAbiertas: 0,
    alertasProximas: 0,
    cumplimiento: 0,
    tiempoMedio: 0,
  });

  const [topActivos, setTopActivos] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const base = axios.create({ baseURL: "http://localhost:3001/api" });

        const [otsAb, alertas, cumplimiento, tiempo, top] = await Promise.all([
          base.get("/estadisticas/ots-abiertas"),
          base.get("/estadisticas/alertas-proximas"),
          base.get("/estadisticas/cumplimiento-mensual"),
          base.get("/estadisticas/tiempo-medio-resolucion"),
          base.get("/estadisticas/top-activos-ots")
        ]);

        setKpis({
          otsAbiertas: otsAb.data.total || 0,
          alertasProximas: alertas.data.total || 0,
          cumplimiento: cumplimiento.data.porcentaje || 0,
          tiempoMedio: tiempo.data.dias || 0,
        });

        setTopActivos(top.data.top || []);
      } catch (err) {
        console.error(err);
        setError("Error cargando datos del dashboard");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // ---------------- GRÁFICOS ----------------
  const dataTopActivos = {
    labels: topActivos.map(a => a.activo),
    datasets: [
      {
        label: "OTs por activo",
        data: topActivos.map(a => a.cantidad),
        backgroundColor: "rgba(30,144,255,0.7)",
        borderRadius: 8
      }
    ]
  };

  const dataCumplimiento = {
    labels: ["Cumplido", "Pendiente"],
    datasets: [
      {
        data: [kpis.cumplimiento, 100 - kpis.cumplimiento],
        backgroundColor: ["#00C49F", "#ECECEC"]
      }
    ]
  };

  return (
    <div className="app-container" style={{ padding: "20px" }}>
      
        <h2
            className="mb-4"
            style={{
                fontWeight: "700",
                background: "#ffffff",
                padding: "15px 20px",
                borderRadius: "10px",
                color: "#000000",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
            }}
            >
            📊 Dashboard General
        </h2>

      {loading && <p style={{ color: "#444" }}>Cargando información...</p>}

      {error && (
        <div className="alert alert-danger" style={{ color: "#721c24" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ----------------------- KPI CARDS ----------------------- */}
          <div
            className="row mb-4"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "20px",
            }}
          >

            {/* KPI card */}
            <div style={cardStyle}>
              <div style={iconCircle("#007bff20")}>📁</div>
              <div>
                <div style={kpiLabel}>OTs abiertas</div>
                <div style={kpiValue}>{kpis.otsAbiertas}</div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={iconCircle("#ffca2c30")}>⏰</div>
              <div>
                <div style={kpiLabel}>Alertas próximas</div>
                <div style={kpiValue}>{kpis.alertasProximas}</div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={iconCircle("#00C49F30")}>✅</div>
              <div>
                <div style={kpiLabel}>Cumplimiento</div>
                <div style={kpiValue}>{kpis.cumplimiento}%</div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={iconCircle("#6f42c130")}>📅</div>
              <div>
                <div style={kpiLabel}>Tiempo medio</div>
                <div style={kpiValue}>{kpis.tiempoMedio} días</div>
              </div>
            </div>

          </div>

          {/* ------------------- GRÁFICOS ------------------- */}
          <div className="row" style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>

            <div style={chartCard}>
              <h6 style={chartTitle}>Cumplimiento global</h6>
              <Doughnut data={dataCumplimiento} />
            </div>

            <div style={{ ...chartCard, flex: 2 }}>
              <h6 style={chartTitle}>OTs por activo</h6>
              <Bar data={dataTopActivos} />
            </div>

          </div>

        </>
      )}
    </div>
  );
}


/* ---------------------- ESTILOS ---------------------- */
const cardStyle = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "15px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
  display: "flex",
  alignItems: "center",
  gap: "15px",
};

const iconCircle = (bg) => ({
  background: bg,
  padding: "12px",
  borderRadius: "50%",
  fontSize: "20px"
});

const kpiLabel = {
  fontSize: "15px",
  color: "#555",
  fontWeight: "500"
};

const kpiValue = {
  fontSize: "26px",
  color: "#111",
  fontWeight: "800"
};

const chartCard = {
  background: "#fff",
  padding: "20px",
  borderRadius: "15px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  flex: 1
};

const chartTitle = {
  fontSize: "18px",
  fontWeight: "700",
  marginBottom: "10px",
  color: "#0d6efd"
};
