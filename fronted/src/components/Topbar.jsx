import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoVictor from '../assets/victor-morales-logo.png';

export default function Topbar({ onToggle, collapsed=false }) {
  const navigate = useNavigate();
  const user = (() => { try { return JSON.parse(localStorage.getItem('auth_user')||'null') || {}; } catch(e){ return {}; } })();

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/');
  };

  return (
    <header className="app-topbar">
      <div className="topbar-left d-flex align-items-center">
        <button className="btn btn-icon me-2" onClick={onToggle} aria-label="toggle sidebar">{collapsed ? '☰' : '☰'}</button>
        <img src={logoVictor} alt="BíoTrans" style={{height:34, marginRight:12}} />
        <div>
          <div style={{fontWeight:700}}>BíoTrans Ltda</div>
          <div style={{fontSize:12, color:'#6b7280'}}>Victor Morales · El partner de tu taller</div>
        </div>
      </div>

      <div className="topbar-right d-flex align-items-center">
        <div className="me-3 small text-muted">{user.nombre || 'Gerente Demo'}</div>
        <button className="btn btn-ghost me-2" title="Notificaciones">🔔</button>
        <div className="avatar me-3">{(user.nombre||'U').slice(0,1)}</div>
        <button className="btn btn-outline-danger btn-sm" onClick={logout}>Cerrar sesión</button>
      </div>
    </header>
  );
}
