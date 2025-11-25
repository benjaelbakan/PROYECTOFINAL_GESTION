import { useState } from "react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        const res = await fetch("http://localhost:3001/api/RF08_auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            return alert(data.msg || data.message || "Error al iniciar sesión");
        }

        // BACKEND YA DEVUELVE "rol" DIRECTAMENTE
        localStorage.setItem("token", data.token);
        localStorage.setItem("rol", data.rol || data.user?.rol);

        window.location.href = "/";
    };

    return (
        <div className="login-container">
            <h2>Iniciar Sesión</h2>

            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">Ingresar</button>
            </form>
        </div>
    );
}
