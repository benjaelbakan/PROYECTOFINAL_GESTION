import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

// Páginas principales
import Activos from "./pages/Activos";
import CrearActivo from "./pages/CrearActivo";
import EditarActivo from "./pages/EditarActivo";
import GenerarOT from "./pages/GenerarOT";

// RF04
import RegistroTarea from "./pages/RF04_RegistroTarea";
import ListaTareas from "./pages/RF04_ListaTareas";

// RF07
import RF07_KPI from "./pages/RF07_kpi.jsx";

// Login
import Login from "./pages/Login";

// Componentes
import ProtectedRoute from "./components/ProtectedRoute";

import logoVictor from "./assets/victor-morales-logo.png";

function App() {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("rol");
    window.location.href = "/login";
  };

  return (
    <div className="bg-dark min-vh-100 text-light">
      {/* NAVBAR - visible solo si hay sesión */}
      {token && (
        <nav className="navbar navbar-dark bg-dark border-bottom border-secondary">
          <div className="container d-flex justify-content-between">

            {/* LOGO */}
            <div className="navbar-brand d-flex align-items-center">
              <img
                src={logoVictor}
                alt="Victor Morales - El partner de tu taller"
                style={{ height: 36, marginRight: 10 }}
              />
              <div className="d-flex flex-column">
                <span className="fw-semibold">BíoTrans Ltda</span>
                <small className="text-secondary">
                  Sistema de Gestión de Mantenimiento
                </small>
              </div>
            </div>

            {/* MENU DE OPCIONES */}
            <div>
              {/* ADMIN / GERENTE → Gestión de activos */}
              {(rol === "ADMIN" || rol === "GERENTE") && (
                <>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `btn btn-sm me-2 ${
                        isActive ? "btn-light text-dark" : "btn-outline-light"
                      }`
                    }
                  >
                    Activos
                  </NavLink>

                  <NavLink
                    to="/activos/nuevo"
                    className={({ isActive }) =>
                      `btn btn-sm me-2 ${
                        isActive ? "btn-success" : "btn-outline-success"
                      }`
                    }
                  >
                    Nuevo Activo
                  </NavLink>

                  <NavLink
                    to="/ot/nueva"
                    className={({ isActive }) =>
                      `btn btn-sm me-2 ${
                        isActive
                          ? "btn-warning text-dark"
                          : "btn-outline-warning"
                      }`
                    }
                  >
                    Generar OT
                  </NavLink>
                </>
              )}

              {/* ADMIN / GERENTE / MECANICO → Tareas */}
              {(rol === "ADMIN" || rol === "GERENTE" || rol === "MECANICO") && (
                <NavLink
                  to="/tareas/registro"
                  className={({ isActive }) =>
                    `btn btn-sm ${
                      isActive ? "btn-info text-dark" : "btn-outline-info"
                    }`
                  }
                >
                  🛠️ Tareas
                </NavLink>
              )}

              {/* ADMIN / GERENTE → KPI */}
              {(rol === "ADMIN" || rol === "GERENTE") && (
                <NavLink
                  to="/kpi"
                  className={({ isActive }) =>
                    `btn btn-sm ms-2 ${
                      isActive ? "btn-primary" : "btn-outline-primary"
                    }`
                  }
                >
                  📊 KPI
                </NavLink>
              )}

              {/* Botón Cerrar Sesión */}
              <button onClick={logout} className="btn btn-sm btn-danger ms-3">
                Cerrar sesión
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* CONTENIDO */}
      <main className="py-4">
        <div className="container">
          <Routes>
            {/* 🔵 Ruta pública */}
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Activos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/activos/nuevo"
              element={
                <ProtectedRoute>
                  <CrearActivo />
                </ProtectedRoute>
              }
            />

            <Route
              path="/activos/:id/editar"
              element={
                <ProtectedRoute>
                  <EditarActivo />
                </ProtectedRoute>
              }
            />

            <Route
              path="/ot/nueva"
              element={
                <ProtectedRoute>
                  <GenerarOT />
                </ProtectedRoute>
              }
            />

            {/* RF04 */}
            <Route
              path="/tareas/registro"
              element={
                <ProtectedRoute>
                  <RegistroTarea />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tareas/lista"
              element={
                <ProtectedRoute>
                  <ListaTareas />
                </ProtectedRoute>
              }
            />

            {/* RF07 */}
            <Route
              path="/kpi"
              element={
                <ProtectedRoute>
                  <RF07_KPI />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
