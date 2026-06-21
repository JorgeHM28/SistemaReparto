#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

if [ ! -f .env ]; then
  echo "Creando .env desde .env.example..."
  cp .env.example .env
  echo "Editá .env con tus contraseñas antes de continuar en producción."
fi

echo "Construyendo e iniciando servicios de producción..."
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "Sistema desplegado."
echo "  App: http://localhost (o tu dominio/VPS)"
echo ""
echo "Comandos útiles:"
echo "  Ver logs:    docker compose -f docker-compose.prod.yml logs -f"
echo "  Detener:     docker compose -f docker-compose.prod.yml down"
echo "  Backup BD:   ./scripts/backup-mysql.sh"
