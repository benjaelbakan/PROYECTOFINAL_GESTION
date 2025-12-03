import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const rol = localStorage.getItem("rol");

  const [loading, setLoading] = useState(true);

  const [data] = useState({
    kpis: { activosTotal: 25, activosOperativos: 18, otsActivas: 4, costoTotal: 2400000, costoPromedio: 96000 },
    estados: { operativos: 18, mantenimiento: 5, averiados: 2 },
    alertas: [{ id: 1 }, { id: 2 }],
    actividad: [
      { id: 1, descripcion: "Cambio de filtro", orden_id: 10, fecha_registro: "2025-11-20", costo: 45000 },
      { id: 2, descripcion: "Revisión completa", orden_id: 11, fecha_registro: "2025-11-21", costo: 120000 },
    ]
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const dinero = (monto) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(monto);

  const calcPorcentaje = (v) =>
    data.kpis.activosTotal > 0 ? (v / data.kpis.activosTotal) * 100 : 0;

  if (loading)
    return <div className="text-white p-5 text-center">Cargando Dashboard...</div>;

  return (
    <div className="d-flex">

      {/* SIDEBAR */}
      <div
        className="p-3"
        style={{
          width: "260px",
          minHeight: "100vh",
          backgroundColor: "#1E1E2F",
          color: "white",
        }}
      >
        <h4 className="fw-bold mb-4 text-center">
          <i className="bi bi-list-task me-2"></i> Menú
        </h4>

        <div className="list-group">

          {(rol === "admin" || rol === "gerente") && (
            <button className="list-group-item list-group-item-action"
              onClick={() => navigate("/activos")}>
              <i className="bi bi-truck me-2"></i> Gestión de Activos
            </button>
          )}

          {(rol === "admin" || rol === "gerente" || rol === "mecanico") && (
            <button className="list-group-item list-group-item-action"
              onClick={() => navigate("/ordenes_trabajo")}>
              <i className="bi bi-tools me-2"></i> Gestión de OT
            </button>
          )}

          {(rol === "admin" || rol === "mecanico") && (
            <button className="list-group-item list-group-item-action"
              onClick={() => navigate("/escaner")}>
              <i className="bi bi-upc-scan me-2"></i> Escáner QR
            </button>
          )}

          {(rol === "admin" || rol === "gerente") && (
            <>
              <button className="list-group-item list-group-item-action"
                onClick={() => navigate("/tareas")}>
                <i className="bi bi-list-check me-2"></i> Gestión de Tareas
              </button>

              <button className="list-group-item list-group-item-action"
                onClick={() => navigate("/planes")}>
                <i className="bi bi-calendar-check me-2"></i> Gestión de Planes
              </button>

              <button className="list-group-item list-group-item-action"
                onClick={() => navigate("/gerente-dashboard")}>
                <i className="bi bi-graph-up-arrow me-2"></i> Dashboard Gerente
              </button>
            </>
          )}

        </div>
      </div>

      {/* CONTENIDO CENTRAL */}
      <div className="flex-grow-1 p-4">

        {/* TÍTULO PRINCIPAL */}
        <div className="mb-4 p-3 rounded" style={{ backgroundColor: "white" }}>
          <h2 className="fw-bold text-dark mb-1">
            <i className="bi bi-speedometer2 me-2"></i>
            Dashboard General
          </h2>
          <p className="text-secondary mb-0">Panel principal del sistema.</p>
        </div>

        {/* ALERTAS */}
        {data.alertas.length > 0 ? (
          <div className="alert alert-danger d-flex align-items-center mb-4">
            <i className="bi bi-exclamation-octagon-fill fs-4 me-3"></i>
            <div>
              <strong className="d-block">Atención Requerida</strong>
              <span>Hay {data.alertas.length} activos con alto kilometraje.</span>
            </div>
          </div>
        ) : (
          <div className="alert alert-success d-flex align-items-center mb-4">
            <i className="bi bi-check-circle-fill fs-4 me-3"></i>
            <span>No hay alertas críticas.</span>
          </div>
        )}

        {/* KPIs */}
        <div className="row mb-4">
          {/* Tarjeta KPI 1 */}
          <div className="col-md-3 mb-3">
            <div className="card-custom p-3 d-flex flex-row justify-content-between">
              <div>
                <span className="text-secondary small">Activos Totales</span>
                <h3 className="text-white fw-bold">{data.kpis.activosTotal}</h3>
                <small className="text-success">{data.kpis.activosOperativos} operativos</small>
              </div>
              <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                <i className="bi bi-truck fs-3 text-primary"></i>
              </div>
            </div>
          </div>

          {/* Tarjeta KPI 2 */}
          <div className="col-md-3 mb-3">
            <div className="card-custom p-3 d-flex flex-row justify-content-between">
              <div>
                <span className="text-secondary small">OTs activas</span>
                <h3 className="text-white fw-bold">{data.kpis.otsActivas}</h3>
                <small className="text-warning">Pendientes</small>
              </div>
              <div className="bg-warning bg-opacity-10 p-3 rounded-3">
                <i className="bi bi-tools fs-3 text-warning"></i>
              </div>
            </div>
          </div>

          {/* Tarjeta KPI 3 */}
          <div className="col-md-3 mb-3">
            <div className="card-custom p-3 d-flex flex-row justify-content-between">
              <div>
                <span className="text-secondary small">Gasto total</span>
                <h3 className="text-white fw-bold fs-5">{dinero(data.kpis.costoTotal)}</h3>
              </div>
              <div className="bg-danger bg-opacity-10 p-3 rounded-3">
                <i className="bi bi-cash-coin fs-3 text-danger"></i>
              </div>
            </div>
          </div>

          {/* Tarjeta KPI 4 */}
          <div className="col-md-3 mb-3">
            <div className="card-custom p-3 d-flex flex-row justify-content-between">
              <div>
                <span className="text-secondary small">Promedio por activo</span>
                <h3 className="text-white fw-bold fs-5">{dinero(data.kpis.costoPromedio)}</h3>
              </div>
              <div className="bg-success bg-opacity-10 p-3 rounded-3">
                <i className="bi bi-graph-up fs-3 text-success"></i>
              </div>
            </div>
          </div>
        </div>

        {/* ESTADO FLOTAS & ACTIVIDAD */}
        <div className="row">

          {/* ESTADO DE FLOTA */}
          <div className="col-lg-6 mb-4">
            <div className="card-custom h-100">
              <div className="card-header-custom">
                <h5 className="text-white mb-0">
                  <i className="bi bi-bar-chart-fill me-2"></i>
                  Estado de la flota
                </h5>
              </div>

              <div className="card-body-custom">

                {/* Operativos */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between text-secondary">
                    <span><i className="bi bi-circle-fill text-success me-2"></i>Operativos</span>
                    <span>{data.estados.operativos}/{data.kpis.activosTotal}</span>
                  </div>
                  <div className="progress bg-secondary bg-opacity-25">
                    <div className="progress-bar bg-success"
                      style={{ width: `${calcPorcentaje(data.estados.operativos)}%` }} />
                  </div>
                </div>

                {/* Mantenimiento */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between text-secondary">
                    <span><i className="bi bi-circle-fill text-warning me-2"></i>Mantenimiento</span>
                    <span>{data.estados.mantenimiento}/{data.kpis.activosTotal}</span>
                  </div>
                  <div className="progress bg-secondary bg-opacity-25">
                    <div className="progress-bar bg-warning"
                      style={{ width: `${calcPorcentaje(data.estados.mantenimiento)}%` }} />
                  </div>
                </div>

                {/* Averiados */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between text-secondary">
                    <span><i className="bi bi-circle-fill text-danger me-2"></i>Averiados</span>
                    <span>{data.estados.averiados}/{data.kpis.activosTotal}</span>
                  </div>
                  <div className="progress bg-secondary bg-opacity-25">
                    <div className="progress-bar bg-danger"
                      style={{ width: `${calcPorcentaje(data.estados.averiados)}%` }} />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ACTIVIDAD RECIENTE */}
          <div className="col-lg-6">
            <div className="card-custom">
              <div className="card-header-custom">
                <h5 className="text-white mb-0">
                  <i className="bi bi-clock-history me-2"></i>
                  Actividad reciente
                </h5>
              </div>
              <div className="card-body-custom">
                <ul className="list-unstyled">
                  {data.actividad.map((act) => (
                    <li key={act.id} className="mb-3">
                      <h6 className="text-white">
                        <i className="bi bi-wrench me-2"></i>
                        {act.descripcion}
                      </h6>
                      <div className="text-secondary small mb-1">
                        OT-{act.orden_id} • {new Date(act.fecha_registro).toLocaleDateString()}
                      </div>
                      <span className="badge bg-secondary bg-opacity-25 text-light">
                        {dinero(act.costo)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
