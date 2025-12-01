import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';

/**
 * Componente de ejemplo para enviar correos via EmailJS.
 * Requiere definir en `fronted/.env.local`:
 * VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY
 *
 * El template de EmailJS debe aceptar variables: `to_email`, `subject`, `html`
 */
export default function EmailJSForm({ defaultTo = '', defaultSubject = '', defaultHtml = '' }) {
  const formRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceId || !templateId || !publicKey) {
      setStatus({ ok: false, message: 'Faltan VITE_EMAILJS_* variables en fronted/.env.local' });
      return;
    }
    setLoading(true);
    setStatus(null);
    const to = e.target.to.value;
    const subject = e.target.subject.value;
    const html = e.target.html.value;

    // Validación básica del email destino
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!to || !emailRegex.test(to)) {
      setStatus({ ok: false, message: 'El campo "To" debe contener un email válido.' });
      setLoading(false);
      return;
    }

    // Mapear múltiples keys que los templates suelen usar: `to_email`, `email`, `to`
    const templateParams = {
      to_email: to,
      to,
      email: to,
      user_email: to,
      subject,
      html
    };

    try {
      const res = await emailjs.send(serviceId, templateId, templateParams, publicKey);
      setStatus({ ok: true, message: 'Correo enviado correctamente', detail: res.text || res.status });
    } catch (err) {
      setStatus({ ok: false, message: err.text || err.message || String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <form ref={formRef} onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>To (email)</label>
          <input name="to" type="email" defaultValue={defaultTo} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Subject</label>
          <input name="subject" type="text" defaultValue={defaultSubject} required style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>HTML content</label>
          <textarea name="html" defaultValue={defaultHtml} rows={8} style={{ width: '100%' }} />
        </div>
        <div>
          <button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar via EmailJS'}</button>
        </div>
      </form>
      {status && (
        <div style={{ marginTop: 12, color: status.ok ? 'green' : 'red' }}>
          <strong>{status.ok ? 'OK' : 'ERROR'}:</strong> {status.message}
          {status.detail ? (<div style={{ fontSize: 12, color: '#666' }}>{String(status.detail)}</div>) : null}
        </div>
      )}
    </div>
  );
}
