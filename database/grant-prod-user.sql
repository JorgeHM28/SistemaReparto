-- Ejecutar manualmente si producción usa un volumen MySQL ya existente
-- docker exec -i sistema-repartos-mysql-1 mysql -uroot -p<TU_ROOT_PASSWORD> < database/grant-prod-user.sql

CREATE USER IF NOT EXISTS 'repartos_user'@'%' IDENTIFIED BY 'cambiar_password_seguro';
GRANT ALL PRIVILEGES ON sistema_repartos.* TO 'repartos_user'@'%';
FLUSH PRIVILEGES;
