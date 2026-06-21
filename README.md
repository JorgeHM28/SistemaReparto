# Sistema Repartos

Sistema de gestión de repartos con frontend React, backend PHP y base de datos MySQL, ejecutado con Docker Compose.

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Docker Engine + Docker Compose)
- Node.js 22+ (desarrollo local del frontend, opcional si usás solo Docker)
- Git

## Estructura

```
SistemaRepartos/
├── frontend/          # React + Vite
├── backend/           # API PHP (Apache)
├── database/          # Scripts SQL de inicialización
├── docs/
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Inicio rápido

1. Cloná o copiá el proyecto.
2. Desde la raíz del proyecto:

```bash
docker compose up --build
```

3. Servicios disponibles:

| Servicio  | URL                      |
|-----------|--------------------------|
| Frontend  | http://localhost:5173    |
| Backend   | http://localhost:8000    |
| Adminer   | http://localhost:8080    |
| MySQL     | localhost:3306 (solo conexión directa) |

### Conectar Adminer a MySQL

En http://localhost:8080 usá estos datos:

| Campo      | Valor              |
|------------|--------------------|
| Sistema    | MySQL              |
| Servidor   | `mysql`            |
| Usuario    | `root`             |
| Contraseña | `root`             |
| Base       | `sistema_repartos` |

## Verificación

- **Backend:** abrí http://localhost:8000 — debe mostrar `API Sistema Repartos funcionando`.
- **Frontend:** abrí http://localhost:5173 — interfaz de desarrollo Vite.
- **Base de datos:** se crea automáticamente al levantar MySQL por primera vez (`database/init.sql`).

## Desarrollo local (sin Docker)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

Requiere PHP 8.3+ con Apache y extensión `pdo_mysql`. Apuntá el document root a `backend/public/`.

## Credenciales MySQL (desarrollo)

- **Host:** `mysql` (desde contenedores) / `localhost` (desde el host)
- **Base de datos:** `sistema_repartos`
- **Usuario:** `root`
- **Contraseña:** `root`

## Usuarios de prueba (autenticación)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@sistema.com | admin123 |
| Repartidor | repartidor@sistema.com | repartidor123 |
| Cliente | cliente@sistema.com | cliente123 |

## API Auth (Módulo 1)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/register` | Registro de clientes |
| POST | `/auth/logout` | Cerrar sesión (requiere token) |
| GET | `/auth/me` | Usuario actual (requiere token) |
| POST | `/auth/recuperar-password` | Solicitar recuperación |
| POST | `/auth/restablecer-password` | Restablecer con token |

## API Usuarios (Módulo 3 — solo admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/usuarios?search=&rol=` | Listar y buscar usuarios |
| GET | `/usuarios/{id}` | Ver un usuario |
| POST | `/usuarios` | Crear usuario |
| PUT | `/usuarios/{id}` | Editar usuario |
| DELETE | `/usuarios/{id}` | Eliminar usuario |

## API Pedidos (Módulo 4)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pedidos?search=&estado=` | Listar (filtrado por rol) |
| GET | `/pedidos/{id}` | Ver pedido |
| POST | `/pedidos` | Crear pedido |
| PUT | `/pedidos/{id}` | Editar / cambiar estado |
| DELETE | `/pedidos/{id}` | Eliminar (solo admin) |

**Estados:** pendiente, asignado, en_ruta, entregado, cancelado

## API Rutas (Módulo 5 + 6 básico)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/rutas` | Listar rutas |
| GET | `/rutas/disponibles` | Pedidos sin ruta (admin) |
| GET | `/rutas/activa` | Ruta del día (repartidor) |
| GET | `/rutas/{id}` | Detalle con paradas |
| POST | `/rutas` | Crear ruta con pedidos |
| PUT | `/rutas/{id}` | Cambiar estado |
| POST | `/rutas/{id}/optimizar` | Ordenar por vecino más cercano |
| DELETE | `/rutas/{id}` | Eliminar ruta |

## API Ubicaciones (Módulos 8 y 9)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/ubicaciones` | Repartidor envía GPS |
| GET | `/ubicaciones` | Admin: todas las últimas ubicaciones |
| GET | `/ubicaciones?repartidor_id=` | Última ubicación de un repartidor |
| GET | `/ubicaciones/mapa` | Pedidos activos + repartidores (admin) |

## Dashboard y Reportes (Módulos 10–13)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/dashboard/admin` | Stats + mapa (admin) |
| GET | `/dashboard/cliente` | Stats del cliente |
| GET | `/dashboard/repartidor` | Stats del repartidor |
| GET | `/reportes` | Reportes completos (admin) |

## Detener servicios

```bash
docker compose down
```

Para eliminar también los datos de MySQL:

```bash
docker compose down -v
```

---

## Producción (Módulo 15)

Stack optimizado con Nginx como puerta de entrada, frontend compilado y backend empaquetado.

### Arquitectura

```
Internet → Nginx (:80)
              ├── /auth, /pedidos, /usuarios... → Backend PHP
              └── /*                             → Frontend React (estático)
                    MySQL (interno, sin puerto expuesto)
```

### Archivos de producción

| Archivo | Descripción |
|---------|-------------|
| `docker-compose.prod.yml` | Stack de producción |
| `frontend/Dockerfile` | Build Vite + Nginx |
| `backend/Dockerfile.prod` | PHP Apache optimizado |
| `nginx/nginx.conf` | Reverse proxy |
| `.env.example` | Variables de entorno |
| `scripts/deploy.sh` | Despliegue automatizado |
| `scripts/backup-mysql.sh` | Backup de MySQL |
| `scripts/restore-mysql.sh` | Restaurar backup |

### Despliegue en VPS (Linux)

1. Cloná el repo en el servidor:

```bash
git clone <tu-repo> sistema-repartos
cd sistema-repartos
```

2. Configurá variables de entorno:

```bash
cp .env.example .env
nano .env   # Cambiá contraseñas, JWT_SECRET y CORS_ORIGIN
```

Variables importantes en `.env`:

| Variable | Descripción |
|----------|-------------|
| `MYSQL_ROOT_PASSWORD` | Contraseña root MySQL |
| `MYSQL_PASSWORD` | Contraseña usuario app |
| `JWT_SECRET` | Clave secreta JWT (larga y aleatoria) |
| `CORS_ORIGIN` | URL pública (`https://tudominio.com`) |
| `VITE_API_URL` | Dejar vacío (usa mismo dominio) |
| `HTTP_PORT` | Puerto HTTP (default `80`) |

3. Desplegá:

```bash
chmod +x scripts/*.sh
./scripts/deploy.sh
```

O manualmente:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

4. Accedé a `http://tu-servidor` (o tu dominio).

### Backup de MySQL

```bash
./scripts/backup-mysql.sh
```

Genera `backups/sistema_repartos_YYYYMMDD_HHMMSS.sql.gz` y conserva los últimos 7.

Restaurar:

```bash
./scripts/restore-mysql.sh backups/sistema_repartos_20260619_120000.sql.gz
```

### Comandos útiles (producción)

```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Reiniciar un servicio
docker compose -f docker-compose.prod.yml restart backend

# Detener
docker compose -f docker-compose.prod.yml down

# Actualizar después de git pull
docker compose -f docker-compose.prod.yml up -d --build
```

### Desarrollo vs Producción

| | Desarrollo | Producción |
|---|-----------|------------|
| Compose | `docker-compose.yml` | `docker-compose.prod.yml` |
| Frontend | Vite hot-reload (:5173) | Build estático + Nginx |
| Backend | Volúmenes montados | Imagen empaquetada |
| Entrada | Puertos separados | Nginx único (:80) |
| Adminer | Incluido (:8080) | No incluido |
| MySQL | Puerto 3306 expuesto | Solo red interna |

### HTTPS (opcional)

Para HTTPS en VPS, se recomienda **Certbot** con Nginx en el host o un proxy como **Caddy/Traefik** delante del stack. Configurá `CORS_ORIGIN=https://tudominio.com` acorde a tu dominio.

### Error de conexión a la base de datos

**Causa común:** el volumen `mysql_data` de desarrollo ya existía con usuario `root` / contraseña `root`, pero producción intenta conectar con `repartos_user` del `.env`.

**Solución rápida** (mantener datos existentes):

```bash
docker exec -i sistema-repartos-mysql-1 mysql -uroot -proot < database/grant-prod-user.sql
```

(Ajustá la contraseña root si la cambiaste.)

**Solución limpia** (base de datos nueva en producción):

```bash
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build
```

Producción usa el volumen `mysql_prod_data` (separado del de desarrollo) para evitar conflictos.
