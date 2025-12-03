import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const credencialesValidas = ["admin", "gerente", "mecanico"];

    if (!credencialesValidas.includes(usuario)) {
      alert("Usuario no válido");
      return;
    }

    if (password !== "demo123") {
      alert("Contraseña incorrecta");
      return;
    }

    // Guardar datos (sin base de datos)
    localStorage.setItem("rol", usuario);
    localStorage.setItem("auth", "true");

    // Redirigir a home
    navigate("/home");
  };

  return (
    <div className="container mt-5">
      <h2>Iniciar sesión</h2>

      <form onSubmit={handleLogin}>
        <div className="form-group mb-3">
          <label>Usuario</label>
          <input
            type="text"
            className="form-control"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="admin | gerente | mecanico"
          />
        </div>

        <div className="form-group mb-3">
          <label>Contraseña</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="demo123"
          />
        </div>

        <button className="btn btn-primary w-100" type="submit">
          Entrar
        </button>
      </form>
    </div>
  );
}
