USE sistema_repartos;

ALTER TABLE usuarios ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE usuarios ADD COLUMN reset_token VARCHAR(255) NULL;
ALTER TABLE usuarios ADD COLUMN reset_token_expires DATETIME NULL;

INSERT IGNORE INTO usuarios (nombre, email, password, rol, activo, created_at, updated_at) VALUES
('Administrador', 'admin@sistema.com', '$2y$10$UfPLvPvgjOnGzW8eT5Z6wOqzM.v90Jz7BrfHHa4lnoVscaoMBH49m', 'admin', 1, NOW(), NOW()),
('Repartidor Demo', 'repartidor@sistema.com', '$2y$10$.amNXjXA0ExMAu2dXAwA2uFSJ5WQEm53v7eMgpwZKd.A7n6t.w.s.', 'repartidor', 1, NOW(), NOW()),
('Cliente Demo', 'cliente@sistema.com', '$2y$10$agJdNB2gdB50WaieX4/.geEloT0LEX1aosFc3Gax3bb7zmJJPu75O', 'cliente', 1, NOW(), NOW());
