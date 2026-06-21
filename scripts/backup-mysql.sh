#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_DIR}/backups"
COMPOSE_FILE="${PROJECT_DIR}/docker-compose.prod.yml"
ENV_FILE="${PROJECT_DIR}/.env"

mkdir -p "$BACKUP_DIR"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: no existe .env. Copiá .env.example a .env primero."
  exit 1
fi

source "$ENV_FILE"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/sistema_repartos_${TIMESTAMP}.sql"

echo "Generando backup en ${BACKUP_FILE}..."

docker compose -f "$COMPOSE_FILE" exec -T mysql \
  mysqldump -u root -p"${MYSQL_ROOT_PASSWORD}" \
  --single-transaction --routines --triggers \
  "${MYSQL_DATABASE:-sistema_repartos}" > "$BACKUP_FILE"

gzip "$BACKUP_FILE"

echo "Backup completado: ${BACKUP_FILE}.gz"

# Mantener solo los últimos 7 backups
ls -t "${BACKUP_DIR}"/sistema_repartos_*.sql.gz 2>/dev/null | tail -n +8 | xargs -r rm --

echo "Listo."
