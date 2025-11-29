Backend - PROYECTOFINAL_GESTION

Cómo ejecutar en desarrollo

1. Instalar dependencias

   cd backend
   npm install

2. Crear .env local (si tu backend usa variables). Ejemplo mínimo:

   DB_HOST=localhost
   DB_USER=root
   DB_PASS=
   DB_NAME=gestiona
   PORT=3001

3. Ejecutar el servidor

   npm run dev

Endpoints importantes
- `/api/alertas/enviar-alertas` — enviar alertas
- `/api/alertas/notificaciones` — historial de notificaciones
- `/api/ot` — órdenes de trabajo
- `/api/activos` — activos

Notas
- Si haces `git mv fronted frontend` recuerda revisar las variables de `proxy` en `frontend/package.json` si existen rutas relativas.
- Revisa `README.md` en la raíz y el `fronted/README.md` para instrucciones del frontend.
