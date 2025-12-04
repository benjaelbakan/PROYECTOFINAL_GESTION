import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importamos Axios
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

import { Bar, Doughnut } from 'react-chartjs-2';

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
  const navigate = useNavigate();

  const [kpis, setKpis] = useState({
    otsAbiertas: 0,
    alertasProximas: 0,
    cumplimiento: 0,
    tiempoMedio: 0,
  });

  const [topActivos, setTopActivos] = useState([]);

  useEffect(() => {
    cargarDatosReales();
  }, []);

  const cargarDatosReales = async () => {
    try {
        setLoading(true);
        
        // 1. Pedimos Activos y OTs al backend
        // CORREGIDO: Usamos la ruta '/api/ordenes/orden_trabajo' que usas en CrearPlan
        const [resActivos, resOTs] = await Promise.all([
            axios.get("http://localhost:3001/api/activos"),
            axios.get("http://localhost:3001/api/ordenes/orden_trabajo") 
        ]);

        const activos = resActivos.data || [];
        const ots = resOTs.data || [];

        console.log("Datos cargados en Dashboard:", { activos: activos.length, ots: ots.length });

        // --- CÁLCULO DE KPIs REALES ---

        // 1. OTs Abiertas (Pendientes o En Proceso)
        const abiertas = ots.filter(ot => 
            ot.estado && (ot.estado.toLowerCase() === 'pendiente' || ot.estado.toLowerCase() === 'en_proceso')
        ).length;

        // 2. Alertas (OTs Vencidas)
        const hoy = new Date();
        const vencidas = ots.filter(ot => {
            if (!ot.fecha_programada || ot.estado.toLowerCase() === 'completado') return false;
            const fechaProg = new Date(ot.fecha_programada);
            return fechaProg < hoy;
        }).length;

        // 3. Cumplimiento
        const completadas = ots.filter(ot => ot.estado && ot.estado.toLowerCase() === 'completado').length;
        const totalOTs = ots.length;
        const porcentajeCumplimiento = totalOTs > 0 ? Math.round((completadas / totalOTs) * 100) : 0;

        // 4. Costo Promedio
        const costoTotal = ots.reduce((sum, ot) => sum + Number(ot.costo || 0), 0);
        const costoPromedio = totalOTs > 0 ? Math.round(costoTotal / totalOTs) : 0;


        // --- CÁLCULO DE TOP ACTIVOS ---
        const conteoPorActivo = {};
        ots.forEach(ot => {
            const id = ot.activo_id;
            if(id) conteoPorActivo[id] = (conteoPorActivo[id] || 0) + 1;
        });

        const ranking = Object.keys(conteoPorActivo).map(idActivo => {
            const activo = activos.find(a => a.id == idActivo);
            return {
                nombre: activo ? `${activo.marca} ${activo.modelo}` : `Activo #${idActivo}`,
                cantidad: conteoPorActivo[idActivo]
            };
        });

        ranking.sort((a, b) => b.cantidad - a.cantidad);
        const top5 = ranking.slice(0, 5);

        setKpis({
            otsAbiertas: abiertas,
            alertasProximas: vencidas,
            cumplimiento: porcentajeCumplimiento,
            tiempoMedio: costoPromedio
        });

        setTopActivos(top5);

    } catch (error) {
        console.error("Error calculando dashboard:", error);
        // Si falla, podrías intentar cargar datos de ejemplo o dejar en 0
    } finally {
        setLoading(false);
    }
  };

  // --- CONFIGURACIÓN DE GRÁFICOS ---
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#adb5bd' } }
    },
    scales: {
      x: {
        ticks: { color: '#adb5bd' },
        grid: { color: '#495057', borderColor: '#495057' }
      },
      y: {
        ticks: { color: '#adb5bd', precision: 0 },
        grid: { color: '#495057', borderColor: '#495057' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#adb5bd' } }
    }
  };

  const dataTopActivos = {
    labels: topActivos.map(a => a.nombre),
    datasets: [
      {
        label: "Cantidad de OTs",
        data: topActivos.map(a => a.cantidad),
        backgroundColor: "rgba(13, 110, 253, 0.6)",
        borderColor: "rgba(13, 110, 253, 1)",
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const dataCumplimiento = {
    labels: ["Completadas", "Pendientes/Otras"],
    datasets: [
      {
        data: [kpis.cumplimiento, 100 - kpis.cumplimiento],
        backgroundColor: ["#198754", "#343a40"],
        borderColor: ["#198754", "#495057"],
        borderWidth: 1
      }
    ]
  };

  // Componente Tarjeta KPI
  const KpiCard = ({ title, value, icon, color, subtext }) => (
    <div className="col-12 col-md-6 col-xl-3">
        <div className="card bg-dark border border-secondary shadow-lg rounded-4 h-100">
            <div className="card-body d-flex align-items-center">
                <div className={`rounded-3 p-3 me-3 bg-${color} bg-opacity-10 text-${color} d-flex align-items-center justify-content-center`} style={{width: '64px', height: '64px'}}>
                    <i className={`bi ${icon} fs-2`}></i>
                </div>
                <div>
                    <h6 className="text-secondary text-uppercase small mb-1">{title}</h6>
                    <h2 className="text-white fw-bold mb-0">{value}</h2>
                    {subtext && <small className="text-white-50" style={{fontSize: '0.75rem'}}>{subtext}</small>}
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="container-fluid p-4">
      
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
            <button 
                className="btn btn-sm btn-outline-secondary mb-2 border-0 ps-0 text-white-50"
                onClick={() => navigate('/home')}
            >
                <i className="bi bi-arrow-left me-2"></i> Volver al Inicio
            </button>
            <h2 className="text-white fw-bold mb-0 d-flex align-items-center">
                <i className="bi bi-speedometer2 me-2 text-primary bg-primary bg-opacity-10 p-2 rounded-3"></i>
                Dashboard Gerencial
            </h2>
            <p className="text-secondary mb-0 mt-1 small ms-1">Resumen en tiempo real de la base de datos.</p>
        </div>
        <button className="btn btn-dark border-secondary text-secondary btn-sm" onClick={cargarDatosReales}>
             <i className="bi bi-arrow-clockwise me-1"></i> Actualizar
        </button>
      </div>

      {loading ? (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-secondary mt-3">Analizando datos...</p>
        </div>
      ) : (
        <>
          {/* KPI CARDS */}
          <div className="row g-4 mb-4">
            <KpiCard 
                title="OTs Pendientes" 
                value={kpis.otsAbiertas} 
                icon="bi-hourglass-split" 
                color="warning" 
                subtext="Órdenes activas"
            />
            <KpiCard 
                title="OTs Vencidas" 
                value={kpis.alertasProximas} 
                icon="bi-exclamation-octagon" 
                color="danger" 
                subtext="Fecha prog. pasada"
            />
            <KpiCard 
                title="Tasa de Cierre" 
                value={`${kpis.cumplimiento}%`} 
                icon="bi-pie-chart" 
                color="success" 
                subtext="% de OTs completadas"
            />
            <KpiCard 
                title="Costo Promedio" 
                value={`$${kpis.tiempoMedio}`} 
                icon="bi-cash-coin" 
                color="info" 
                subtext="Por Orden de Trabajo"
            />
          </div>

          {/* GRÁFICOS */}
          <div className="row g-4">
            <div className="col-lg-8">
                <div className="card bg-dark border border-secondary shadow-lg rounded-4 h-100">
                    <div className="card-header bg-transparent border-bottom border-secondary py-3">
                        <h5 className="text-white mb-0">
                            <i className="bi bi-bar-chart-line-fill me-2 text-primary"></i>
                            Activos con más Mantenimientos
                        </h5>
                    </div>
                    <div className="card-body" style={{ height: '300px' }}>
                        <Bar data={dataTopActivos} options={commonOptions} />
                    </div>
                </div>
            </div>

            <div className="col-lg-4">
                <div className="card bg-dark border border-secondary shadow-lg rounded-4 h-100">
                    <div className="card-header bg-transparent border-bottom border-secondary py-3">
                        <h5 className="text-white mb-0">
                            <i className="bi bi-activity me-2 text-success"></i>
                            Eficiencia Global
                        </h5>
                    </div>
                    <div className="card-body d-flex flex-column justify-content-center align-items-center" style={{ height: '300px' }}>
                        <div style={{ width: '100%', height: '80%' }}>
                            <Doughnut data={dataCumplimiento} options={doughnutOptions} />
                        </div>
                        <div className="mt-2 text-center">
                            <span className="text-white fw-bold fs-4">{kpis.cumplimiento}%</span>
                            <br/>
                            <span className="text-secondary small">Eficiencia de cierre</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}