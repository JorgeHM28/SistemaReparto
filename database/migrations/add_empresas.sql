USE sistema_repartos;

-- ==========================
-- TABLA EMPRESAS
-- ==========================
CREATE TABLE IF NOT EXISTS empresas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB;

INSERT IGNORE INTO empresas (id, nombre, slug, activo, created_at, updated_at)
VALUES (1, 'Empresa Demo', 'empresa-demo', 1, NOW(), NOW());

-- ==========================
-- COLUMNA empresa_id EN USUARIOS
-- (ejecutar solo si la columna no existe)
-- ==========================
ALTER TABLE usuarios ADD COLUMN empresa_id BIGINT UNSIGNED NULL AFTER id;

UPDATE usuarios SET empresa_id = 1 WHERE empresa_id IS NULL;

ALTER TABLE usuarios MODIFY COLUMN empresa_id BIGINT UNSIGNED NOT NULL;

ALTER TABLE usuarios
    ADD CONSTRAINT fk_usuario_empresa
        FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE RESTRICT;

-- ==========================
-- COLUMNA empresa_id EN PEDIDOS
-- ==========================
ALTER TABLE pedidos ADD COLUMN empresa_id BIGINT UNSIGNED NULL AFTER id;

UPDATE pedidos p
INNER JOIN usuarios c ON p.cliente_id = c.id
SET p.empresa_id = c.empresa_id
WHERE p.empresa_id IS NULL;

ALTER TABLE pedidos MODIFY COLUMN empresa_id BIGINT UNSIGNED NOT NULL;

ALTER TABLE pedidos
    ADD CONSTRAINT fk_pedido_empresa
        FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE RESTRICT;

CREATE INDEX idx_usuarios_empresa ON usuarios (empresa_id);
CREATE INDEX idx_pedidos_empresa ON pedidos (empresa_id);
