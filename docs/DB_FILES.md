DB files detectados en el repo y recomendaciones

Archivos SQL en la raíz y subcarpetas:
- `backup_mantenimiento_22-11.sql` (raíz)
- `OT_tmp.sql` (raíz)
- `Benja_db/benja_mantenimiento_22-11.sql`
- `Nico_db/OT.sql`

Recomendaciones
- Consolidar backups y snapshots en `db_backups/`.
- Mantener en la raíz sólo archivos necesarios para inicializar la base de datos de desarrollo (ej.: `schema.sql`, `seed.sql`).
- Para backups históricos, usar nombres con fecha y breve descriptor: `backup_YYYY-MM-DD_descripcion.sql`.

Sugerencia práctica
- Mantén `Benja_db` y `Nico_db` por ahora como snapshot locales; cuando estés listo, mueve estas carpetas a `db_backups/`.
- Si quieres, puedo:
  - Crear `db_backups/` y mover los archivos mediante `git mv` (el script `scripts/organize_project.sh` lo hace de forma interactiva).
  - Generar un `schema.sql` y `seed.sql` si me pasas la estructura o muestras de datos que quieras mantener.

Notas de seguridad
- Evita incluir credenciales en estos archivos. Si hay dumps que contengan datos sensible, muévelos fuera del repo y documenta su ubicación segura.
