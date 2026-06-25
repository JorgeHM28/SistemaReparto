<?php

namespace App\Models;

use PDO;

class Pedido
{
    private const ESTADOS = ['pendiente', 'asignado', 'en_ruta', 'entregado', 'cancelado'];

    public function __construct(private PDO $pdo)
    {
    }

    public static function estadosValidos(): array
    {
        return self::ESTADOS;
    }

    public function getAll(array $filters = []): array
    {
        $sql = 'SELECT p.*,
                       c.nombre AS cliente_nombre, c.email AS cliente_email,
                       r.nombre AS repartidor_nombre, r.email AS repartidor_email
                FROM pedidos p
                INNER JOIN usuarios c ON p.cliente_id = c.id
                LEFT JOIN usuarios r ON p.repartidor_id = r.id
                WHERE 1=1';
        $params = [];

        if (!empty($filters['empresa_id'])) {
            $sql .= ' AND p.empresa_id = :empresa_id';
            $params['empresa_id'] = $filters['empresa_id'];
        }

        if (!empty($filters['cliente_id'])) {
            $sql .= ' AND p.cliente_id = :cliente_id';
            $params['cliente_id'] = $filters['cliente_id'];
        }

        if (!empty($filters['repartidor_id'])) {
            $sql .= ' AND p.repartidor_id = :repartidor_id';
            $params['repartidor_id'] = $filters['repartidor_id'];
        }

        if (!empty($filters['estado'])) {
            $sql .= ' AND p.estado = :estado';
            $params['estado'] = $filters['estado'];
        }

        if (!empty($filters['search'])) {
            $sql .= ' AND (p.direccion_entrega LIKE :search OR c.nombre LIKE :search OR c.email LIKE :search OR r.nombre LIKE :search)';
            $params['search'] = '%' . $filters['search'] . '%';
        }

        $sql .= ' ORDER BY p.created_at DESC';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT p.*,
                    c.nombre AS cliente_nombre, c.email AS cliente_email,
                    r.nombre AS repartidor_nombre, r.email AS repartidor_email
             FROM pedidos p
             INNER JOIN usuarios c ON p.cliente_id = c.id
             LEFT JOIN usuarios r ON p.repartidor_id = r.id
             WHERE p.id = :id
             LIMIT 1'
        );
        $stmt->execute(['id' => $id]);
        $pedido = $stmt->fetch();

        return $pedido ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO pedidos
             (empresa_id, cliente_id, repartidor_id, direccion_entrega, latitud, longitud, estado, created_at, updated_at)
             VALUES (:empresa_id, :cliente_id, :repartidor_id, :direccion_entrega, :latitud, :longitud, :estado, NOW(), NOW())'
        );
        $stmt->execute([
            'empresa_id' => $data['empresa_id'],
            'cliente_id' => $data['cliente_id'],
            'repartidor_id' => $data['repartidor_id'] ?? null,
            'direccion_entrega' => $data['direccion_entrega'],
            'latitud' => $data['latitud'],
            'longitud' => $data['longitud'],
            'estado' => $data['estado'] ?? 'pendiente',
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = ['id' => $id];

        foreach (['direccion_entrega', 'latitud', 'longitud', 'estado', 'repartidor_id', 'fecha_entrega'] as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $fields[] = 'updated_at = NOW()';
        $sql = 'UPDATE pedidos SET ' . implode(', ', $fields) . ' WHERE id = :id';

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute($params);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM pedidos WHERE id = :id');

        return $stmt->execute(['id' => $id]);
    }
}
