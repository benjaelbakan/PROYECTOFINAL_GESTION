import React, { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchWithFallback } from '../api';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export default function GerenteDashboard() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({});
  const [topActivos, setTopActivos] = useState([]);
  const [activos, setActivos] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [query, setQuery] = useState('');
  const [actionMessage, setActionMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  // Si no hay token o usuario con rol GERENTE, redirigir al login inmediatamente
  useEffect(() => {
    try {
      const token = localStorage.getItem('auth_token');
      const u = JSON.parse(localStorage.getItem('auth_user') || 'null');
      if (!token || !(u && (u.role || '').toUpperCase() === 'GERENTE')) {
        navigate('/login-gerente');
      }
    } catch (e) {
      navigate('/login-gerente');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
          const [r1, r2, r3, r4, r5] = await Promise.all([
          fetchWithFallback('/estadisticas/ots-abiertas'),
          fetchWithFallback('/estadisticas/alertas-proximas'),
          fetchWithFallback('/estadisticas/cumplimiento-mensual'),
          fetchWithFallback('/estadisticas/tiempo-medio-resolucion'),
          fetchWithFallback('/estadisticas/top-activos-ots'),
        ]);
        // Si alguno responde 401/403, redirigir a login
        const results = [r1, r2, r3, r4, r5];
        for (const rr of results) {
          if (!rr || rr.status === 401 || rr.status === 403) {
            return navigate('/login-gerente');
          }
        }
        setKpis({
          otsAbiertas: r1.data.total || 0,
          alertasProximas: r2.data.total || 0,
          cumplimiento: r3.data.porcentaje || 0,
          tiempoMedio: r4.data.dias || 0,
        });
        setTopActivos(r5.data.top || []);
        // Traer notificaciones recientes
        try {
          const nr = await fetchWithFallback('/alertas/notificaciones');
          setNotificaciones((nr && nr.data && nr.data.rows) || nr.data || []);
        } catch (e) {
          // ignore, not critical
        }

        // Traer activos para la tabla central (si existe endpoint)
        try {
          const ra = await fetchWithFallback('/activos');
          setActivos((ra && ra.data) || []);
        } catch (e) {
          // ignore
        }
      } catch (err) {
        console.error('Error cargando KPIs', err);
        // Si hay un error de red (p. ej. token expirado o backend inaccesible), redirigir a login
        if (err && (!err.response || err.message && err.message.toLowerCase().includes('network'))) {
          navigate('/login-gerente');
          return;
        }
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Mostrar botón de logout cuando el usuario baja al final de la página
  // showLogout removed: logout moved to Topbar

  const topData = {
    labels: topActivos.map(t => t.activo),
    datasets: [
      {
        label: 'OTs (últimos 180 días)',
        data: topActivos.map(t => t.cantidad),
        backgroundColor: 'rgba(54,162,235,0.6)'
      }
    ]
  };

  // Generar una serie de tendencia simple (últimos 6 meses) como ejemplo
  const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const trendData = {
    labels: months,
    datasets: [
      {
        label: 'OTs creadas',
        data: months.map((m, i) => ((topActivos[i] && topActivos[i].cantidad) || Math.max(0, Math.round((i + 1) * 0.8)))),
        borderColor: 'rgba(99, 102, 241, 0.9)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        fill: true,
      }
    ]
  };

  const cumplimientoData = {
    labels: ['Cumplimiento', 'Pendientes'],
    datasets: [
      {
        data: [kpis.cumplimiento || 0, 100 - (kpis.cumplimiento || 0)],
        backgroundColor: ['#198754', '#6c757d']
      }
    ]
  };

  const chartOptions = {
    plugins: {
      legend: { labels: { color: '#27404a' } },
      title: { color: '#27404a' }
    },
    scales: {
      x: { ticks: { color: '#27404a' }, grid: { color: 'rgba(0,0,0,0.05)' } },
      y: { ticks: { color: '#27404a' }, grid: { color: 'rgba(0,0,0,0.05)' } }
    }
  };

  return (
    <div className="app-container">
      <h2 className="text-dark">Dashboard Gerente</h2>
      {loading && <p>Cargando KPIs...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          <div className="kpi-row mb-3">
            <div className="kpi-card">
              <div className="kpi-title">Total OTs abiertas</div>
              <div className="kpi-value">{kpis.otsAbiertas}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Alertas próximas (umbral)</div>
              <div className="kpi-value">{kpis.alertasProximas}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Cumplimiento (30d)</div>
              <div className="kpi-value">{kpis.cumplimiento}%</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Tiempo medio resolución</div>
              <div className="kpi-value">{kpis.tiempoMedio} días</div>
            </div>
          </div>
          {/* Nueva fila de gráficos adicionales */}
          <div className="row g-3 mb-3">
            <div className="panel col-12 col-md-4">
              <h6>Cumplimiento (últimos 30d)</h6>
              <div style={{maxWidth: 320, margin: '0 auto'}}>
                <Doughnut data={cumplimientoData} options={chartOptions} />
                <div className="small text-center mt-2">{kpis.cumplimiento || 0}% cumplimiento</div>
              </div>
            </div>

            <div className="panel col-12 col-md-4">
              <h6>Tendencia OTs (últimos meses)</h6>
              <div style={{height: 160}}>
                <Line data={trendData} options={{...chartOptions, maintainAspectRatio: false}} />
              </div>
            </div>

            <div className="panel col-12 col-md-4">
              <h6>OTs por estado (vista rápida)</h6>
              <div style={{maxWidth: 320, margin: '0 auto'}}>
                <Doughnut data={{ labels: ['Abiertas','En progreso','Cerradas'], datasets:[{ data: [kpis.otsAbiertas || 0, Math.max(0, Math.round((kpis.otsAbiertas || 0) * 0.4)), Math.max(0, Math.round((kpis.otsAbiertas || 0) * 0.6)) ], backgroundColor:['#f6c23e','#36a2eb','#198754'] }] }} options={chartOptions} />
                <div className="small text-center mt-2">Resumen rápido de estados</div>
              </div>
            </div>
          </div>
          <div className="manager-center">
            <div className="manager-card">
              <div className="dashboard-grid">
                <div className="panel col-12">
                  <h6>Top activos con más OTs</h6>
                  <Bar data={topData} />
                </div>
                <div className="panel col-12 mt-3">
                  <h6>Acciones rápidas</h6>
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-primary" onClick={() => navigate('/ot/nueva')}>Crear OT</button>
                      <button className="btn btn-sm btn-outline-success" onClick={async () => {
                        setActionMessage(null);
                        setActionLoading(true);
                        try {
                          const r = await fetchWithFallback('/alertas/enviar-alertas', { method: 'GET' });
                          setActionMessage(r.data && r.data.message ? String(r.data.message) : 'Alertas enviadas (ver detalles en historial)');
                          try { const nr = await fetchWithFallback('/alertas/notificaciones'); setNotificaciones((nr && nr.data && nr.data.rows) || nr.data || []); } catch(e){}
                        } catch (err) {
                          console.error('Error enviando alertas', err);
                          setActionMessage(err && err.message ? String(err.message) : 'Error al enviar alertas');
                        } finally { setActionLoading(false); }
                      }}>{actionLoading ? 'Enviando...' : 'Enviar Alertas'}</button>
                      <button className="btn btn-sm btn-outline-warning" onClick={async () => {
                        setActionMessage('Exportando Excel...');
                        try {
                          const r = await fetchWithFallback('/ot');
                          const rows = r.data || [];
                          const headers = ['id','activo_id','tipo','descripcion','fecha_programada','trabajador_asignado','estado'];
                          try {
                            const XLSX = (await import('xlsx')).default || (await import('xlsx'));
                            const aoa = [headers].concat(rows.map(row => headers.map(h => row[h] == null ? '' : row[h])));
                            const ws = XLSX.utils.aoa_to_sheet(aoa);
                            const wb = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(wb, ws, 'OTs');
                            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                            const blob = new Blob([wbout], { type: 'application/octet-stream' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `reporte_ots_${new Date().toISOString().slice(0,10)}.xlsx`;
                            document.body.appendChild(a);
                            a.click(); a.remove(); URL.revokeObjectURL(url);
                            setActionMessage('Excel descargado');
                          } catch (xlsxErr) {
                            console.warn('xlsx not available, falling back to CSV', xlsxErr);
                            const csvHeaders = headers.join(',');
                            const csv = [csvHeaders].concat(rows.map(row => headers.map(h => {
                              const v = row[h] === null || row[h] === undefined ? '' : String(row[h]);
                              return '"' + v.replace(/"/g, '""') + '"';
                            }).join(','))).join('\n');
                            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `reporte_ots_${new Date().toISOString().slice(0,10)}.csv`;
                            document.body.appendChild(a);
                            a.click(); a.remove(); URL.revokeObjectURL(url);
                            setActionMessage('CSV descargado (para .xlsx instala la dependencia "xlsx")');
                          }
                        } catch (err) {
                          console.error('Error exportando reporte', err);
                          setActionMessage(err && err.message ? String(err.message) : 'Error exportando reporte');
                        }
                      }}>Exportar Excel</button>
                      <button className="btn btn-sm btn-outline-info" onClick={async () => {
                        setActionMessage('Generando vista para impresión...');
                        try {
                          const r = await fetchWithFallback('/ot');
                          const rows = r.data || [];
                          const headers = ['ID','Activo','Tipo','Descripción','Fecha programada','Trabajador','Estado'];
                          const html = `
                            <html><head><title>Reporte OTs</title>
                            <style>body{font-family:Arial,Helvetica,sans-serif;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ccc;padding:6px;text-align:left;} th{background:#f4f4f4}</style>
                            </head><body>
                            <h2>Reporte OTs - ${new Date().toLocaleString()}</h2>
                            <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                            <tbody>
                            ${rows.map(row => `<tr>${['id','activo_id','tipo','descripcion','fecha_programada','trabajador_asignado','estado'].map(k => `<td>${String(row[k] == null ? '' : row[k]).replace(/</g,'&lt;')}</td>`).join('')}</tr>`).join('')}
                            </tbody></table></body></html>`;
                          const w = window.open('', '_blank');
                          if (!w) throw new Error('No se pudo abrir ventana de impresión (bloqueador?)');
                          w.document.write(html);
                          w.document.close();
                          setTimeout(() => { w.focus(); w.print(); }, 300);
                          setActionMessage('Ventana de impresión abierta (guarda como PDF desde el diálogo)');
                        } catch (err) {
                          console.error('Error generando PDF', err);
                          setActionMessage(err && err.message ? String(err.message) : 'Error generando PDF');
                        }
                      }}>Exportar PDF</button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => { navigate('/planificacion'); }}>Ver plan anual</button>
                    </div>
                    {actionMessage && <div className="mt-2 alert alert-info py-1">{actionMessage}</div>}
                    <hr />
                    <div>
                      <h6>Disponibilidad técnicos</h6>
                      <ul className="list-unstyled small">
                        <li>Juan Pérez — Disponible</li>
                        <li>María López — En reparación</li>
                        <li>Catalina Ruiz — Disponible</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Logout moved to Topbar */}

        </>
      )}
    </div>
  );
}
