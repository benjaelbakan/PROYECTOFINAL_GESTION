# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## EmailJS (enviar emails desde el frontend)

Si quieres enviar correos directamente desde el cliente (sin añadir claves secretas al backend), puedes usar EmailJS.

- Instala: `npm install @emailjs/browser` (ya lo hiciste)
- Crea un template en EmailJS y anota `service_id`, `template_id` y `public_key` (User ID).
- Añade en `fronted/.env.local` (no commitear):

```env
VITE_EMAILJS_SERVICE_ID=tu_service_id
VITE_EMAILJS_TEMPLATE_ID=tu_template_id
VITE_EMAILJS_PUBLIC_KEY=tu_public_key
```

- Uso (componente de ejemplo incluido en `fronted/src/components/EmailJSForm.jsx`):

```jsx
import EmailJSForm from './components/EmailJSForm';

// en una página React
<EmailJSForm defaultTo="destino@gmail.com" defaultSubject="Alerta" defaultHtml="<p>Mensaje</p>" />
```

Notas:
- El template de EmailJS debe usar variables que recibirá el template (por ejemplo `to_email`, `subject`, `html`).
- Los `VITE_` vars están disponibles como `import.meta.env.VITE_...` en Vite.
