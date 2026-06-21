CREATE DATABASE IF NOT EXISTS sistema_repartos
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE sistema_repartos;

-- ==========================
-- TABLA USUARIOS
-- ==========================
CREATE TABLE usuarios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

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
    updated_at TIMESTAMP NULL DEFAULT NULL

) ENGINE=InnoDB;

-- ==========================
-- TABLA PEDIDOS
-- ==========================
CREATE TABLE pedidos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

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

    CONSTRAINT fk_pedido_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_pedido_repartidor
        FOREIGN KEY (repartidor_id)
        REFERENCES usuarios(id)
        ON DELETE SET NULL

) ENGINE=InnoDB;

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

-- ==========================
-- USUARIOS DE PRUEBA
-- admin@sistema.com / admin123
-- repartidor@sistema.com / repartidor123
-- cliente@sistema.com / cliente123
-- ==========================
INSERT INTO usuarios (nombre, email, password, rol, activo, created_at, updated_at) VALUES
('Administrador', 'admin@sistema.com', '$2y$10$UfPLvPvgjOnGzW8eT5Z6wOqzM.v90Jz7BrfHHa4lnoVscaoMBH49m', 'admin', 1, NOW(), NOW()),
('Repartidor Demo', 'repartidor@sistema.com', '$2y$10$.amNXjXA0ExMAu2dXAwA2uFSJ5WQEm53v7eMgpwZKd.A7n6t.w.s.', 'repartidor', 1, NOW(), NOW()),
('Cliente Demo', 'cliente@sistema.com', '$2y$10$agJdNB2gdB50WaieX4/.geEloT0LEX1aosFc3Gax3bb7zmJJPu75O', 'cliente', 1, NOW(), NOW());
