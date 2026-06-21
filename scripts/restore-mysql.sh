#!/bin/bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Uso: ./scripts/restore-mysql.sh <archivo_backup.sql|archivo_backup.sql.gz>"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="${PROJECT_DIR}/docker-compose.prod.yml"
ENV_FILE="${PROJECT_DIR}/.env"
BACKUP_FILE="$1"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: no existe .env"
  exit 1
fi

source "$ENV_FILE"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: archivo no encontrado: $BACKUP_FILE"
  exit 1
fi

echo "ADVERTENCIA: esto sobrescribirá la base de datos ${MYSQL_DATABASE}."
read -p "¿Continuar? (s/N): " confirm
if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
  echo "Cancelado."
  exit 0
fi

if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | docker compose -f "$COMPOSE_FILE" exec -T mysql \
    mysql -u root -p"${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}"
else
  docker compose -f "$COMPOSE_FILE" exec -T mysql \
    mysql -u root -p"${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}" < "$BACKUP_FILE"
fi

echo "Restauración completada."
