import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Normalizamos a minúsculas para evitar errores (Admin vs admin)
    const userLower = usuario.trim().toLowerCase();
    const credencialesValidas = ["admin", "gerente", "mecanico"];

    if (!credencialesValidas.includes(userLower)) {
      alert("Usuario no válido. Prueba con: admin, gerente o mecanico.");
      return;
    }

    if (password !== "demo123") {
      alert("Contraseña incorrecta.");
      return;
    }

    // --- GUARDADO DE DATOS DE SESIÓN ---
    
    // 1. Objeto Usuario (para que el Home diga "Hola, Admin")
    const datosUsuario = {
        nombre: userLower, // Aquí podrías poner "Juan Pérez" si viniera de BD
        rol: userLower,
        email: `${userLower}@empresa.com`
    };
    localStorage.setItem("usuario", JSON.stringify(datosUsuario));

    // 2. Rol explícito (para la protección de rutas en App.js)
    localStorage.setItem("rol", userLower);

    // 3. Bandera de autenticación (por si tu RequireAuth la busca)
    localStorage.setItem("auth", "true");
    localStorage.setItem("token", "dummy-token-12345"); // Simulamos un token

    // Redirigir al Home
    navigate("/home");
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100 bg-dark">
      
      {/* Tarjeta de Login Centrada */}
      <div className="card p-4 shadow-lg border-secondary bg-dark text-white" style={{ maxWidth: "400px", width: "100%" }}>
        
        <div className="text-center mb-4">
            <div className="mb-3">
                <i className="bi bi-gear-wide-connected text-primary display-1"></i>
            </div>
            <h2 className="fw-bold text-white">Iniciar Sesión</h2>
            <p className="text-secondary small">Sistema de Gestión de Mantenimiento</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group mb-3">
            <label className="form-label text-secondary small fw-bold">USUARIO</label>
            <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-secondary"><i className="bi bi-person-fill"></i></span>
                <input
                type="text"
                className="form-control bg-secondary bg-opacity-10 text-white border-secondary focus-ring focus-ring-primary"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ej: admin"
                autoFocus
                />
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="form-label text-secondary small fw-bold">CONTRASEÑA</label>
            <div className="input-group">
                <span className="input-group-text bg-dark border-secondary text-secondary"><i className="bi bi-lock-fill"></i></span>
                <input
                type="password"
                className="form-control bg-secondary bg-opacity-10 text-white border-secondary focus-ring focus-ring-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••"
                />
            </div>
          </div>

          <button className="btn btn-primary w-100 fw-bold py-2 shadow-sm mb-3" type="submit">
            Entrar al Sistema
          </button>
        </form>
        
        <div className="text-center border-top border-secondary pt-3">
            <small className="text-white-50 d-block mb-1">Credenciales de prueba:</small>
            <span className="badge bg-secondary me-1">admin</span>
            <span className="badge bg-secondary me-1">gerente</span>
            <span className="badge bg-secondary">mecanico</span>
            <div className="text-muted small mt-2">Pass: demo123</div>
        </div>

      </div>
    </div>
  );
}