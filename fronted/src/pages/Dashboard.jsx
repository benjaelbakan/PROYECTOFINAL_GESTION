export default function Dashboard() {
    const rol = localStorage.getItem("rol");

    return (
        <div>
            <h1>Panel Principal</h1>

            {rol === "ADMIN" && (
                <button>Administrar Usuarios</button>
            )}

            {(rol === "ADMIN" || rol === "GERENTE") && (
                <button>Ver KPI</button>
            )}

            {rol === "MECANICO" && (
                <button>Registrar Tareas</button>
            )}
        </div>
    );
}
