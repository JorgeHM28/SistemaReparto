CREATE DATABASE IF NOT EXISTS sistema_repartos
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE sistema_repartos;

-- ==========================
-- TABLA EMPRESAS
-- ==========================
CREATE TABLE empresas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(150) NOT NULL,

    slug VARCHAR(100) NOT NULL UNIQUE,

    activo TINYINT(1) NOT NULL DEFAULT 1,

    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL

) ENGINE=InnoDB;

-- ==========================
-- TABLA USUARIOS
-- ==========================
CREATE TABLE usuarios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    empresa_id BIGINT UNSIGNED NOT NULL,

    nombre VARCHAR(100) NOT NULL,

    email VARCHAR(100) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    telefono VARCHAR(20),

    rol ENUM(
        'admin',
        'repartidor',
        'cliente'
    ) NOT NULL,

    activo TINYINT(1) NOT NULL DEFAULT 1,

    reset_token VARCHAR(255) NULL,
    reset_token_expires DATETIME NULL,

    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    CONSTRAINT fk_usuario_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresas(id)
        ON DELETE RESTRICT

) ENGINE=InnoDB;

CREATE INDEX idx_usuarios_empresa ON usuarios (empresa_id);

-- ==========================
-- TABLA PEDIDOS
-- ==========================
CREATE TABLE pedidos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    empresa_id BIGINT UNSIGNED NOT NULL,

    cliente_id BIGINT UNSIGNED NOT NULL,

    repartidor_id BIGINT UNSIGNED NULL,

    direccion_entrega TEXT NOT NULL,

    latitud DECIMAL(10,8) NOT NULL,

    longitud DECIMAL(11,8) NOT NULL,

    estado ENUM(
        'pendiente',
        'asignado',
        'en_ruta',
        'entregado',
        'cancelado'
    ) DEFAULT 'pendiente',

    fecha_entrega DATETIME NULL,

    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    CONSTRAINT fk_pedido_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresas(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_pedido_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_pedido_repartidor
        FOREIGN KEY (repartidor_id)
        REFERENCES usuarios(id)
        ON DELETE SET NULL

) ENGINE=InnoDB;

CREATE INDEX idx_pedidos_empresa ON pedidos (empresa_id);

-- ==========================
-- TABLA UBICACIONES GPS
-- ==========================
CREATE TABLE ubicaciones (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    repartidor_id BIGINT UNSIGNED NOT NULL,

    latitud DECIMAL(10,8) NOT NULL,

    longitud DECIMAL(11,8) NOT NULL,

    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ubicacion_repartidor
        FOREIGN KEY (repartidor_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE

) ENGINE=InnoDB;

-- ==========================
-- TABLA RUTAS
-- ==========================
CREATE TABLE rutas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    repartidor_id BIGINT UNSIGNED NOT NULL,

    fecha DATE NOT NULL,

    estado ENUM(
        'pendiente',
        'en_proceso',
        'finalizada'
    ) DEFAULT 'pendiente',

    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    CONSTRAINT fk_ruta_repartidor
        FOREIGN KEY (repartidor_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE

) ENGINE=InnoDB;

-- ==========================
-- DETALLE DE RUTA
-- ==========================
CREATE TABLE ruta_detalle (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    ruta_id BIGINT UNSIGNED NOT NULL,

    pedido_id BIGINT UNSIGNED NOT NULL,

    orden_entrega INT NOT NULL,

    CONSTRAINT fk_detalle_ruta
        FOREIGN KEY (ruta_id)
        REFERENCES rutas(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_detalle_pedido
        FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id)
        ON DELETE CASCADE

) ENGINE=InnoDB;

-- ============================================================
-- DATOS DE PRUEBA — Santa Cruz de la Sierra, Bolivia
-- ============================================================
-- Contraseñas:
--   Admins:       admin123
--   Repartidores: repartidor123
--   Clientes:     cliente123
-- ============================================================

-- ==========================
-- EMPRESAS (ambas operan en Santa Cruz)
-- ==========================
INSERT INTO empresas (id, nombre, slug, activo, created_at, updated_at) VALUES
(1, 'Cruceña Express Delivery', 'crucena-express', 1, NOW(), NOW()),
(2, 'Santa Cruz Envíos Rápidos', 'scz-envios', 1, NOW(), NOW());

-- ==========================
-- USUARIOS - EMPRESA 1: Cruceña Express Delivery
-- Zona: Norte y Centro de Santa Cruz
-- ==========================
INSERT INTO usuarios (id, empresa_id, nombre, email, password, telefono, rol, activo, created_at, updated_at) VALUES
(1,  1, 'Carlos Mendoza',    'admin@crucenaexpress.com',              '$2y$10$UfPLvPvgjOnGzW8eT5Z6wOqzM.v90Jz7BrfHHa4lnoVscaoMBH49m', '71234567', 'admin',       1, NOW(), NOW()),
(2,  1, 'Miguel Quispe',     'miguel.repartidor@crucenaexpress.com',  '$2y$10$.amNXjXA0ExMAu2dXAwA2uFSJ5WQEm53v7eMgpwZKd.A7n6t.w.s.', '72345678', 'repartidor',  1, NOW(), NOW()),
(3,  1, 'Roberto Choque',    'roberto.repartidor@crucenaexpress.com', '$2y$10$.amNXjXA0ExMAu2dXAwA2uFSJ5WQEm53v7eMgpwZKd.A7n6t.w.s.', '73456789', 'repartidor',  1, NOW(), NOW()),
(4,  1, 'Ana Mamani',        'ana.cliente@crucenaexpress.com',        '$2y$10$agJdNB2gdB50WaieX4/.geEloT0LEX1aosFc3Gax3bb7zmJJPu75O', '74567890', 'cliente',     1, NOW(), NOW()),
(5,  1, 'Luis Condori',      'luis.cliente@crucenaexpress.com',       '$2y$10$agJdNB2gdB50WaieX4/.geEloT0LEX1aosFc3Gax3bb7zmJJPu75O', '75678901', 'cliente',     1, NOW(), NOW()),
(6,  1, 'María Flores',      'maria.cliente@crucenaexpress.com',     '$2y$10$agJdNB2gdB50WaieX4/.geEloT0LEX1aosFc3Gax3bb7zmJJPu75O', '76789012', 'cliente',     1, NOW(), NOW());

-- ==========================
-- USUARIOS - EMPRESA 2: Santa Cruz Envíos Rápidos
-- Zona: Sur y Este de Santa Cruz
-- ==========================
INSERT INTO usuarios (id, empresa_id, nombre, email, password, telefono, rol, activo, created_at, updated_at) VALUES
(7,  2, 'Patricia Rojas',    'admin@sczenvios.com',                   '$2y$10$UfPLvPvgjOnGzW8eT5Z6wOqzM.v90Jz7BrfHHa4lnoVscaoMBH49m', '67891234', 'admin',       1, NOW(), NOW()),
(8,  2, 'Fernando Vargas',   'fernando.repartidor@sczenvios.com',     '$2y$10$.amNXjXA0ExMAu2dXAwA2uFSJ5WQEm53v7eMgpwZKd.A7n6t.w.s.', '68912345', 'repartidor',  1, NOW(), NOW()),
(9,  2, 'Javier Torrez',     'javier.repartidor@sczenvios.com',      '$2y$10$.amNXjXA0ExMAu2dXAwA2uFSJ5WQEm53v7eMgpwZKd.A7n6t.w.s.', '69123456', 'repartidor',  1, NOW(), NOW()),
(10, 2, 'Sandra Gutiérrez',  'sandra.cliente@sczenvios.com',          '$2y$10$agJdNB2gdB50WaieX4/.geEloT0LEX1aosFc3Gax3bb7zmJJPu75O', '61234567', 'cliente',     1, NOW(), NOW()),
(11, 2, 'Diego Morales',     'diego.cliente@sczenvios.com',           '$2y$10$agJdNB2gdB50WaieX4/.geEloT0LEX1aosFc3Gax3bb7zmJJPu75O', '62345678', 'cliente',     1, NOW(), NOW()),
(12, 2, 'Carmen Salazar',    'carmen.cliente@sczenvios.com',          '$2y$10$agJdNB2gdB50WaieX4/.geEloT0LEX1aosFc3Gax3bb7zmJJPu75O', '63456789', 'cliente',     1, NOW(), NOW());

-- ==========================
-- PEDIDOS - EMPRESA 1 (Norte/Centro de Santa Cruz)
-- ==========================
INSERT INTO pedidos (id, empresa_id, cliente_id, repartidor_id, direccion_entrega, latitud, longitud, estado, created_at, updated_at) VALUES
(1, 1, 4, 2, 'Av. Monseñor Rivero #300, Equipetrol, Santa Cruz',       -17.77200000, -63.19500000, 'asignado',  NOW(), NOW()),
(2, 1, 5, 2, 'Calle 21 de Mayo #456, Centro, Santa Cruz',              -17.78370000, -63.18200000, 'pendiente', NOW(), NOW()),
(3, 1, 6, 3, 'Av. Cristo Redentor #1500, Barrio Sirari, Santa Cruz',   -17.76100000, -63.17400000, 'en_ruta',   NOW(), NOW());

-- ==========================
-- PEDIDOS - EMPRESA 2 (Sur/Este de Santa Cruz)
-- ==========================
INSERT INTO pedidos (id, empresa_id, cliente_id, repartidor_id, direccion_entrega, latitud, longitud, estado, created_at, updated_at) VALUES
(4, 2, 10, 8, 'Av. Santos Dumont #800, Barrio Urbari, Santa Cruz',     -17.79500000, -63.17100000, 'asignado',  NOW(), NOW()),
(5, 2, 11, 8, 'Av. Cañoto #250, La Ramada, Santa Cruz',                -17.78900000, -63.18800000, 'en_ruta',   NOW(), NOW()),
(6, 2, 12, 9, 'Av. Virgen de Cotoca #3200, Villa 1ro de Mayo, Santa Cruz', -17.80200000, -63.15600000, 'pendiente', NOW(), NOW());

-- ==========================
-- RUTAS - EMPRESA 1 (zonas norte/centro de Santa Cruz)
-- Repartidor Miguel (id=2): 3 rutas
-- Repartidor Roberto (id=3): 2 rutas
-- ==========================
INSERT INTO rutas (id, repartidor_id, fecha, estado, created_at, updated_at) VALUES
-- Ruta 1: Equipetrol - Centro (Miguel)
(1,  2, CURDATE(), 'en_proceso',  NOW(), NOW()),
-- Ruta 2: Av. Banzer - Las Palmas (Miguel)
(2,  2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'pendiente', NOW(), NOW()),
-- Ruta 3: Av. Beni - Hamacas (Miguel)
(3,  2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'finalizada', NOW(), NOW()),
-- Ruta 4: Cristo Redentor - Sirari (Roberto)
(4,  3, CURDATE(), 'en_proceso',  NOW(), NOW()),
-- Ruta 5: Av. Busch - Parque Industrial (Roberto)
(5,  3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'pendiente', NOW(), NOW());

-- ==========================
-- RUTAS - EMPRESA 2 (zonas sur/este de Santa Cruz)
-- Repartidor Fernando (id=8): 3 rutas
-- Repartidor Javier (id=9): 2 rutas
-- ==========================
INSERT INTO rutas (id, repartidor_id, fecha, estado, created_at, updated_at) VALUES
-- Ruta 6: Santos Dumont - Urbari (Fernando)
(6,  8, CURDATE(), 'en_proceso',  NOW(), NOW()),
-- Ruta 7: La Ramada - Mercado Los Pozos (Fernando)
(7,  8, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'pendiente', NOW(), NOW()),
-- Ruta 8: Av. Pirai - Barrio Guapay (Fernando)
(8,  8, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'finalizada', NOW(), NOW()),
-- Ruta 9: Villa 1ro de Mayo - Plan 3000 (Javier)
(9,  9, CURDATE(), 'en_proceso',  NOW(), NOW()),
-- Ruta 10: Av. Virgen de Cotoca - Pampa de la Isla (Javier)
(10, 9, DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'pendiente', NOW(), NOW());

-- ==========================
-- DETALLE DE RUTAS - EMPRESA 1
-- ==========================
INSERT INTO ruta_detalle (ruta_id, pedido_id, orden_entrega) VALUES
-- Ruta 1 (Equipetrol - Centro): pedidos 1 y 2
(1, 1, 1),
(1, 2, 2),
-- Ruta 4 (Cristo Redentor - Sirari): pedido 3
(4, 3, 1);

-- ==========================
-- DETALLE DE RUTAS - EMPRESA 2
-- ==========================
INSERT INTO ruta_detalle (ruta_id, pedido_id, orden_entrega) VALUES
-- Ruta 6 (Santos Dumont - Urbari): pedidos 4 y 5
(6, 4, 1),
(6, 5, 2),
-- Ruta 9 (Villa 1ro de Mayo - Plan 3000): pedido 6
(9, 6, 1);

-- ==========================
-- UBICACIONES GPS (última posición de cada repartidor en Santa Cruz)
-- ==========================
INSERT INTO ubicaciones (repartidor_id, latitud, longitud, fecha_hora) VALUES
-- Miguel Quispe: Equipetrol Norte, Santa Cruz
(2, -17.77000000, -63.19600000, NOW()),
-- Roberto Choque: Av. Cristo Redentor, Santa Cruz
(3, -17.76200000, -63.17500000, NOW()),
-- Fernando Vargas: Av. Santos Dumont, Santa Cruz
(8, -17.79400000, -63.17200000, NOW()),
-- Javier Torrez: Villa 1ro de Mayo, Santa Cruz
(9, -17.80100000, -63.15700000, NOW());
