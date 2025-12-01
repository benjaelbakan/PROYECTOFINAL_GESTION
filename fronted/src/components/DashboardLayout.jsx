import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout(){
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem('sidebarCollapsed');
      setCollapsed(v === '1');
    } catch(e){}
  }, []);

  const toggle = () => {
    setCollapsed(c => {
      const next = !c;
      try { localStorage.setItem('sidebarCollapsed', next ? '1' : '0'); } catch(e){}
      return next;
    });
  };

  return (
    <div className={`app-dashboard ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} />
      <div className="app-main">
        <Topbar onToggle={toggle} collapsed={collapsed} />
        <div className="app-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
