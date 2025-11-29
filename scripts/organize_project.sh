#!/usr/bin/env bash
set -e

echo "Script interactivo: reorganizar proyecto PROYECTOFINAL_GESTION"
echo "IMPORTANTE: Este script usa 'git mv' para preservar historial. Ejecuta en una branch nueva."

read -p "¿Estás en la rama donde quieres aplicar cambios? (S/n) " yn
if [[ "$yn" =~ ^[Nn] ]]; then
  echo "Crea una rama nueva antes de ejecutar: git checkout -b chore/organize-project"
  exit 1
fi

# Crear carpetas si no existen
mkdir -p db_backups
mkdir -p docs
mkdir -p scripts

# Mover SQLs detectados
SQL_FILES=("backup_mantenimiento_22-11.sql" "OT_tmp.sql" )
# añadir los SQL dentro de subcarpetas
if [ -d "Benja_db" ]; then
  SQL_FILES+=("Benja_db/benja_mantenimiento_22-11.sql")
fi
if [ -d "Nico_db" ]; then
  SQL_FILES+=("Nico_db/OT.sql")
fi

for f in "${SQL_FILES[@]}"; do
  if [ -f "$f" ]; then
    echo "Preparando mover $f -> db_backups/"
    read -p "Mover $f a db_backups/? (S/n) " choice
    if [[ "$choice" =~ ^[Nn] ]]; then
      echo "Omitido $f"
    else
      git mv "$f" db_backups/ || ( echo "git mv falló para $f — puede que ya esté movido" )
    fi
  fi
done

# Proponer renombrar fronted -> frontend
if [ -d "fronted" ]; then
  echo "Se detectó carpeta 'fronted'. Se recomienda renombrarla a 'frontend' para claridad."
  read -p "Aplicar git mv fronted -> frontend? (recomendado) (S/n) " c2
  if [[ "$c2" =~ ^[Nn] ]]; then
    echo "Omitido renombrar fronted"
  else
    git mv fronted frontend || ( echo "git mv fronted -> frontend falló" )
  fi
fi

# Mover Benja_db y Nico_db a db_backups (opcional)
for dir in Benja_db Nico_db; do
  if [ -d "$dir" ]; then
    read -p "Mover carpeta $dir a db_backups/? (S/n) " mvdir
    if [[ ! "$mvdir" =~ ^[Nn] ]]; then
      git mv "$dir" db_backups/ || echo "no se pudo mover $dir"
    fi
  fi
done

# Añadir un README de docs si existiera
if [ ! -f docs/PROJECT_STRUCTURE.md ]; then
  cp README.md docs/PROJECT_STRUCTURE.md 2>/dev/null || true
fi

echo "
Operación completada (o preparada). Revisa con: git status
Si todo está bien: git add -A && git commit -m 'chore: reorganizar estructura' && git push
"

echo "Script finalizado."
