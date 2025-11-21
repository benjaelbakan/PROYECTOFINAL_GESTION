// fronted/src/App.jsx
import { Routes, Route, NavLink } from "react-router-dom";
import Activos from "./pages/Activos";
import CrearActivo from "./pages/CrearActivo";
import EditarActivo from "./pages/EditarActivo";
import logoVictor from "./assets/victor-morales-logo.png";

function App() {
  return (
    <div className="bg-dark min-vh-100 text-light">
      {/* NAVBAR */}
      <nav className="navbar navbar-dark bg-dark border-bottom border-secondary">
        <div className="container d-flex justify-content-between">
          <div className="navbar-brand d-flex align-items-center">
            <img
              src={logoVictor}
              alt="Victor Morales - El partner de tu taller"
              style={{ height: 36, marginRight: 10 }}
            />
            <div className="d-flex flex-column">
              <span className="fw-semibold">BíoTrans Ltda</span>
              <small className="text-secondary">
                Victor Morales · El partner de tu taller
              </small>
            </div>
          </div>

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
                "btn btn-sm " +
                (isActive ? "btn-success" : "btn-outline-success")
              }
            >
              Nuevo Activo
            </NavLink>
          </div>
        </div>
      </nav>

      {/* CONTENIDO */}
      <main className="py-4">
        <div className="container">
          <Routes>
            <Route path="/" element={<Activos />} />
            <Route path="/activos/nuevo" element={<CrearActivo />} />
            <Route path="/activos/:id/editar" element={<EditarActivo />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
