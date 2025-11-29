Proyecto: PROYECTOFINAL_GESTION

Objetivo
- Proponer una estructura de proyecto clara y no invasiva.
- Proveer un script seguro que aplique los cambios (interactivo con confirmaciones).
- No modificar código fuente que afecte la ejecución sin tu confirmación.

Estructura propuesta (lógica)

/ (raíz)
- README.md                 # documentación general (ya existe)
- package.json              # meta / scripts del monorepo (si aplica)
- backend/                  # servidor Node/Express
  - package.json
  - src/
  - README.md               # nuevo: cómo ejecutar backend
- frontend/                 # frontend (rename propuesto de `fronted`)
  - package.json
  - src/
  - public/
  - README.md               # ya existe en `fronted/README.md`
- docs/                     # documentación del proyecto (nuevo)
  - PROJECT_STRUCTURE.md    # este archivo
  - DB_FILES.md             # listado y recomendaciones para SQL
- db_backups/               # carpeta propuesta para SQL históricos (nuevo)
- scripts/                  # scripts para mantenimiento (nuevo)

Notas y recomendaciones
- No mover código activo (backend/fronted) sin probar localmente: renombrar `fronted` → `frontend` es recomendable pero romperá rutas en CI o scripts si hay referencias. El script propuesto usa `git mv` para preservar historial.
- Archiva SQL históricos en `db_backups/` y deja en el repo sólo los archivos necesarios para inicializar/testear la DB (p. ej. `schema.sql` y `seed.sql`).
- Mantén `Benja_db/` y `Nico_db/` como snapshots por ahora; el script puede moverlos a `db_backups/` si aceptas.

Cómo aplicar los cambios (sugerido, manual)
1. Revisa el script `scripts/organize_project.sh` que incluí en este repo.
2. Crea una rama nueva para la reorganización:

   git checkout -b chore/organize-project

3. Ejecuta el script y sigue las indicaciones:

   bash scripts/organize_project.sh

4. Revisa con `git status` y `git diff` los `git mv` propuestos. Si todo está bien, haz commit y push.

   git add -A
   git commit -m "chore: reorganizar estructura del repo (mover SQL a db_backups, sugerencias)"
   git push origin chore/organize-project

Si quieres que yo aplique (es decir, haga `git mv`) aquí, dímelo explícitamente — lo haré sólo si confirmas que quieres que modifique la estructura del repositorio directamente.

Contacto/seguimiento
- Puedo:
  - Ajustar el script para más movimientos (p. ej. mover `Benja_db/`, renombrar carpetas)
  - Actualizar `README.md` principales con instrucciones de ejecución y despliegue
  - Ejecutar los `git mv` y abrir un PR con los cambios

---
Generado automáticamente por ayuda del asistente. Revisa antes de ejecutar cualquier script que haga `git mv`.
