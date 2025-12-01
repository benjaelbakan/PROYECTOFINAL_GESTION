import React from 'react';
import { NavLink } from 'react-router-dom';
import logoVictor from '../assets/victor-morales-logo.png';

export default function Sidebar({ collapsed=false }) {
  const userName = (() => {
    try { return (JSON.parse(localStorage.getItem('auth_user')||'null')||{}).nombre || 'Gerente Demo'; } catch(e) { return 'Gerente Demo'; }
  })();

  const NavItem = ({ to, label, icon }) => (
    <NavLink to={to} className={({isActive})=>`nav-item ${isActive?"active":""}`}>
      <span className="nav-icon" aria-hidden>{icon}</span>
      {!collapsed && <span className="nav-label">{label}</span>}
    </NavLink>
  );

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-top d-flex flex-column">
        <div className="d-flex align-items-center mb-2">
          <img src={logoVictor} alt="BíoTrans" style={{height:34, marginRight: collapsed ? 6 : 10}} />
          {!collapsed && (
            <div>
              <div style={{fontWeight:700}}>BíoTrans Ltda</div>
              <div style={{fontSize:12, color:'rgba(255,255,255,0.85)'}}>Victor Morales · El partner de tu taller</div>
            </div>
          )}
        </div>

        {!collapsed && <div className="user small text-muted mb-2">{userName}</div>}
      </div>

      <nav className="sidebar-nav">
        <NavItem to="/" label="Activos" icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="12" height="12" rx="2" stroke="white" strokeOpacity="0.9"/></svg>} />
        <NavItem to="/ot" label="Ordenes" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18" stroke="white" strokeOpacity="0.9" strokeWidth="1.5" strokeLinecap="round"/></svg>} />
        <NavItem to="/planificacion" label="Planificación" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 5h18M7 3v4" stroke="white" strokeOpacity="0.9" strokeWidth="1.3" strokeLinecap="round"/></svg>} />
        <NavItem to="/historial-alertas" label="Historial" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="white" strokeOpacity="0.9" strokeWidth="1.2"/></svg>} />
        <NavItem to="/suscribir-alertas" label="Suscribirse" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M6 6v12" stroke="white" strokeOpacity="0.9" strokeWidth="1.2" strokeLinecap="round"/></svg>} />
        <NavItem to="/gerente" label="Gerente" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0" stroke="white" strokeOpacity="0.9" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
      </nav>

      <div className="sidebar-footer small text-muted">© {new Date().getFullYear()}</div>
    </aside>
  );
}
