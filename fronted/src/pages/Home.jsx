import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ nombre: "Usuario", rol: "" });

  useEffect(() => {
    // 1. Recuperamos los datos de localStorage
    const dataUsuario = localStorage.getItem("usuario");
    const rolGuardado = localStorage.getItem("rol") || "General";
    
    let nombreParaMostrar = "Usuario"; 

    if (dataUsuario) {
      try {
        // Intentamos parsear por si es un objeto JSON
        const objetoParsed = JSON.parse(dataUsuario);
        
        if (typeof objetoParsed === 'object' && objetoParsed !== null) {
            // Si es objeto, buscamos la propiedad nombre, o email, o username
            nombreParaMostrar = objetoParsed.nombre || objetoParsed.email || "Usuario";
        } else {
            // Si es un string simple (ej: "admin"), lo usamos directo
            nombreParaMostrar = objetoParsed;
        }
      } catch (e) {
        // Si falla el parseo, es texto plano
        nombreParaMostrar = dataUsuario;
      }
    }

    // Limpieza extra: si el nombre quedó con comillas (ej: "Juan"), las quitamos
    if (typeof nombreParaMostrar === 'string') {
        nombreParaMostrar = nombreParaMostrar.replace(/^"(.*)"$/, '$1');
    }

    setUsuario({ nombre: nombreParaMostrar, rol: rolGuardado });
  }, []);

  const handleLogout = () => {
    // Confirmación opcional
    if (window.confirm("¿Deseas cerrar sesión?")) {
        // 1. Limpiar localStorage
        localStorage.clear(); // Borra todo (usuario, rol, token, etc.)
        
        // 2. Redirigir al Login
        navigate("/login");
    }
  };

  // --- CONFIGURACIÓN DE MENÚ SEGÚN ROLES ---
  const menuOptions = [
    {
        title: "Escanear QR",
        icon: "bi-qr-code-scan",
        color: "warning",
        description: "Identificar activo o reportar falla.",
        route: "/escaner",
        delay: "0.1s",
        allowedRoles: ["admin", "mecanico"] 
    },
    {
        title: "Órdenes de Trabajo",
        icon: "bi-tools",
        color: "danger",
        description: "Gestionar mantenimientos pendientes.",
        route: "/ordenes_trabajo",
        delay: "0.2s",
        allowedRoles: ["admin", "gerente"]
    },
    {
        title: "Inventario de Activos",
        icon: "bi-truck",
        color: "primary",
        description: "Ver flota y maquinaria registrada.",
        route: "/activos",
        delay: "0.3s",
        allowedRoles: ["admin", "gerente"]
    },
    {
        title: "Dashboard Gerencial",
        icon: "bi-graph-up-arrow",
        color: "success",
        description: "Ver KPIs, costos y estadísticas.",
        route: "/gerente-dashboard",
        delay: "0.4s",
        allowedRoles: ["admin", "gerente"]
    },
    {
        title: "Planes Mantenimiento",
        icon: "bi-calendar-check",
        color: "info",
        description: "Programar preventivos futuros.",
        route: "/planes",
        delay: "0.5s",
        allowedRoles: ["admin", "gerente"]
    },
    {
        title: "Historial de Tareas",
        icon: "bi-clipboard-data",
        color: "secondary",
        description: "Registro de tareas realizadas.",
        route: "/tareas",
        delay: "0.6s",
        allowedRoles: ["admin", "gerente"]
    }
  ];

  const QuickCard = ({ title, icon, color, description, route, delay }) => (
    <div 
        className="col-12 col-md-6 col-lg-4 mb-4 animate__animated animate__fadeInUp" 
        style={{ animationDelay: delay }}
        onClick={() => navigate(route)}
    >
      <div 
        className={`card h-100 border-0 shadow-lg text-white bg-dark bg-gradient`}
        style={{ cursor: "pointer", transition: "transform 0.2s", borderRadius: "15px", overflow: 'hidden' }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
      >
        <div className={`bg-${color}`} style={{ height: "5px" }}></div>
        <div className="card-body p-4 d-flex align-items-center">
            <div className={`rounded-circle p-3 bg-${color} bg-opacity-25 text-${color} me-3`}>
                <i className={`bi ${icon} display-6`}></i>
            </div>
            <div>
                <h5 className="card-title fw-bold mb-1">{title}</h5>
                <p className="card-text text-white-50 small mb-0">{description}</p>
            </div>
            <div className="ms-auto">
                <i className="bi bi-chevron-right text-secondary"></i>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container p-4">
      
      {/* --- ENCABEZADO CON SALUDO Y LOGOUT --- */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5 animate__animated animate__fadeIn">
        <div>
            <h1 className="display-5 fw-bold text-white">
                Hola, <span className="text-primary text-capitalize">{usuario.nombre}</span> 👋
            </h1>
            <div className="d-flex align-items-center gap-2 mt-2">
                <p className="text-secondary fs-5 mb-0">
                    Bienvenido al Sistema de Gestión.
                </p>
                <span className="badge bg-secondary bg-opacity-25 border border-secondary text-uppercase" style={{fontSize: '0.7rem'}}>
                    {usuario.rol}
                </span>
            </div>
        </div>

        {/* Botón de Cerrar Sesión */}
        <button 
            onClick={handleLogout}
            className="btn btn-outline-danger d-flex align-items-center gap-2 mt-3 mt-md-0 px-4 py-2 rounded-pill hover-scale"
        >
            <i className="bi bi-box-arrow-right fs-5"></i>
            <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* --- GRID DE ACCESOS --- */}
      <div className="row g-4">
        {menuOptions.map((option, index) => {
            if (option.allowedRoles.includes(usuario.rol)) {
                return (
                    <QuickCard 
                        key={index}
                        title={option.title}
                        icon={option.icon}
                        color={option.color}
                        description={option.description}
                        route={option.route}
                        delay={option.delay}
                    />
                );
            }
            return null;
        })}
      </div>

      <div className="mt-5 text-center text-white-50 small animate__animated animate__fadeIn" style={{animationDelay: '1s'}}>
        <p>Sistema de Mantenimiento v2.0 &copy; 2025</p>
      </div>

    </div>
  );
}