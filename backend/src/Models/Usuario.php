<?php

namespace App\Models;

use PDO;

class Usuario
{
    public function __construct(private PDO $pdo)
    {
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM usuarios WHERE email = :email LIMIT 1'
        );
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();

        return $user ?: null;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT u.id, u.empresa_id, u.nombre, u.email, u.telefono, u.rol, u.activo,
                    u.created_at, u.updated_at, e.nombre AS empresa_nombre, e.slug AS empresa_slug
             FROM usuarios u
             INNER JOIN empresas e ON u.empresa_id = e.id
             WHERE u.id = :id LIMIT 1'
        );
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch();

        return $user ?: null;
    }

    public function getAll(?string $search = null, ?string $rol = null, ?int $empresaId = null): array
    {
        $sql = 'SELECT u.id, u.empresa_id, u.nombre, u.email, u.telefono, u.rol, u.activo,
                       u.created_at, u.updated_at
                FROM usuarios u WHERE 1=1';
        $params = [];

        if ($empresaId !== null) {
            $sql .= ' AND u.empresa_id = :empresa_id';
            $params['empresa_id'] = $empresaId;
        }

        if ($rol) {
            $sql .= ' AND u.rol = :rol';
            $params['rol'] = $rol;
        }

        if ($search) {
            $sql .= ' AND (u.nombre LIKE :search OR u.email LIKE :search OR u.telefono LIKE :search)';
            $params['search'] = '%' . $search . '%';
        }

        $sql .= ' ORDER BY u.nombre ASC';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function create(array $data): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO usuarios (empresa_id, nombre, email, password, telefono, rol, activo, created_at, updated_at)
             VALUES (:empresa_id, :nombre, :email, :password, :telefono, :rol, :activo, NOW(), NOW())'
        );
        $stmt->execute([
            'empresa_id' => $data['empresa_id'],
            'nombre' => $data['nombre'],
            'email' => $data['email'],
            'password' => $data['password'],
            'telefono' => $data['telefono'] ?? null,
            'rol' => $data['rol'],
            'activo' => $data['activo'] ?? 1,
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = ['id' => $id];

        foreach (['nombre', 'email', 'telefono', 'rol', 'activo'] as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }

        if (isset($data['password'])) {
            $fields[] = 'password = :password';
            $params['password'] = $data['password'];
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = 'updated_at = NOW()';
        $sql = 'UPDATE usuarios SET ' . implode(', ', $fields) . ' WHERE id = :id';

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute($params);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM usuarios WHERE id = :id');

        return $stmt->execute(['id' => $id]);
    }

    public function updatePassword(int $id, string $hash): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE usuarios SET password = :password, reset_token = NULL,
             reset_token_expires = NULL, updated_at = NOW() WHERE id = :id'
        );
        $stmt->execute(['password' => $hash, 'id' => $id]);
    }

    public function setResetToken(int $id, string $token, string $expires): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE usuarios SET reset_token = :token, reset_token_expires = :expires,
             updated_at = NOW() WHERE id = :id'
        );
        $stmt->execute([
            'token' => $token,
            'expires' => $expires,
            'id' => $id,
        ]);
    }

    public function findByResetToken(string $token): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM usuarios
             WHERE reset_token = :token
             AND reset_token_expires > NOW()
             LIMIT 1'
        );
        $stmt->execute(['token' => $token]);
        $user = $stmt->fetch();

        return $user ?: null;
    }
}
