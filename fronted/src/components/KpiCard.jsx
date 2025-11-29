import React from 'react';

export default function KpiCard({ title, value, hint, color='primary' }){
  return (
    <div className={`kpi-card border-${color}`}>
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">{value}</div>
      {hint && <div className="kpi-hint small text-muted">{hint}</div>}
    </div>
  );
}
