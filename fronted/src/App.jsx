import { BrowserRouter, Routes, Route, NavLink, Link } from "react-router-dom";
import Activos from "./pages/Activos";
import CrearActivo from "./pages/CrearActivo";
import EditarActivo from "./pages/EditarActivo";
import GenerarOT from "./pages/GenerarOT";
import logoVictor from "./assets/victor-morales-logo.png";

// IMPORTAMOS COMPONENTE RF04
import RegistroTarea from "./pages/RF04_RegistroTarea"; 
import ListaTareas from "./pages/RF04_ListaTareas";

function App() {
  return (
    <div className="bg-dark min-vh-100 text-light">
      {/* NAVBAR DE NAVEGACIÓN */}
      <nav className="navbar navbar-dark bg-dark border-bottom border-secondary">
        <div className="container d-flex justify-content-between">
          
          {/* LOGO Y MARCA */}
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

          {/* BOTONES DEL MENÚ */}
          <div>
            <NavLink
              to="/"
              className={({ isActive }) =>
                "btn btn-sm me-2 " +
                (isActive ? "btn-light text-dark" : "btn-outline-light")
              }
            >
              Activos
            </NavLink>
            
            <NavLink
              to="/activos/nuevo"
              className={({ isActive }) =>
                "btn btn-sm me-2 " +
                (isActive ? "btn-success" : "btn-outline-success")
              }
            >
              Nuevo Activo
            </NavLink>

            {/* BOTÓN PARA RF03 (OT) */}
            <NavLink
              to="/ot/nueva"
              className={({ isActive }) =>
                "btn btn-sm me-2 " + 
                (isActive ? "btn-warning text-dark" : "btn-outline-warning")
              }
            >
              Generar OT
            </NavLink>

            {/* --- NUEVO BOTÓN PARA RF04 (TAREAS) --- */}
            <NavLink
              to="/tareas/registro"
              className={({ isActive }) =>
                "btn btn-sm " + 
                (isActive ? "btn-info text-dark" : "btn-outline-info")
              }
            >
              🛠️ Tareas
            </NavLink>

          </div>
        </div>
      </nav>

      {/* CONTENIDO DE LAS PÁGINAS (EL MAPA DE RUTAS) */}
      <main className="py-4">
        <div className="container">
          <Routes>
            {/* Rutas de Activos (Benjamin) */}
            <Route path="/" element={<Activos />} />
            <Route path="/activos/nuevo" element={<CrearActivo />} />
            <Route path="/activos/:id/editar" element={<EditarActivo />} />
            <Route path="/ot/nueva" element={<GenerarOT />} />

            {/* --- NUEVA RUTA PARA RF04 (TU TRABAJO) --- */}
            {/* Cuando la URL sea /tareas/registro, carga tu componente */}
            <Route path="/tareas/registro" element={<RegistroTarea />} />
            <Route path="/tareas/lista" element={<ListaTareas />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;