<?php

namespace App\Models;

use PDO;
use PDOException;

class Ruta
{
    private const ESTADOS = ['pendiente', 'en_proceso', 'finalizada'];

    public function __construct(private PDO $pdo)
    {
    }

    public static function estadosValidos(): array
    {
        return self::ESTADOS;
    }

    public function getAll(array $filters = []): array
    {
        $sql = 'SELECT r.*, u.nombre AS repartidor_nombre, u.email AS repartidor_email,
                       (SELECT COUNT(*) FROM ruta_detalle rd WHERE rd.ruta_id = r.id) AS total_paradas
                FROM rutas r
                INNER JOIN usuarios u ON r.repartidor_id = u.id
                WHERE 1=1';
        $params = [];

        if (!empty($filters['empresa_id'])) {
            $sql .= ' AND u.empresa_id = :empresa_id';
            $params['empresa_id'] = $filters['empresa_id'];
        }

        if (!empty($filters['repartidor_id'])) {
            $sql .= ' AND r.repartidor_id = :repartidor_id';
            $params['repartidor_id'] = $filters['repartidor_id'];
        }

        if (!empty($filters['estado'])) {
            $sql .= ' AND r.estado = :estado';
            $params['estado'] = $filters['estado'];
        }

        if (!empty($filters['fecha'])) {
            $sql .= ' AND r.fecha = :fecha';
            $params['fecha'] = $filters['fecha'];
        }

        $sql .= ' ORDER BY r.fecha DESC, r.created_at DESC';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT r.*, u.nombre AS repartidor_nombre, u.email AS repartidor_email,
                    u.empresa_id
             FROM rutas r
             INNER JOIN usuarios u ON r.repartidor_id = u.id
             WHERE r.id = :id LIMIT 1'
        );
        $stmt->execute(['id' => $id]);
        $ruta = $stmt->fetch();

        return $ruta ?: null;
    }

    public function getParadas(int $rutaId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT rd.orden_entrega, rd.pedido_id,
                    p.direccion_entrega, p.latitud, p.longitud, p.estado,
                    p.cliente_id, c.nombre AS cliente_nombre
             FROM ruta_detalle rd
             INNER JOIN pedidos p ON rd.pedido_id = p.id
             INNER JOIN usuarios c ON p.cliente_id = c.id
             WHERE rd.ruta_id = :ruta_id
             ORDER BY rd.orden_entrega ASC'
        );
        $stmt->execute(['ruta_id' => $rutaId]);

        return $stmt->fetchAll();
    }

    public function createWithPedidos(int $repartidorId, string $fecha, array $pedidoIds): int
    {
        $this->pdo->beginTransaction();

        try {
            $stmt = $this->pdo->prepare(
                'INSERT INTO rutas (repartidor_id, fecha, estado, created_at, updated_at)
                 VALUES (:repartidor_id, :fecha, :estado, NOW(), NOW())'
            );
            $stmt->execute([
                'repartidor_id' => $repartidorId,
                'fecha' => $fecha,
                'estado' => 'pendiente',
            ]);

            $rutaId = (int) $this->pdo->lastInsertId();
            $orden = 1;

            foreach ($pedidoIds as $pedidoId) {
                $detalle = $this->pdo->prepare(
                    'INSERT INTO ruta_detalle (ruta_id, pedido_id, orden_entrega)
                     VALUES (:ruta_id, :pedido_id, :orden)'
                );
                $detalle->execute([
                    'ruta_id' => $rutaId,
                    'pedido_id' => $pedidoId,
                    'orden' => $orden++,
                ]);

                $updatePedido = $this->pdo->prepare(
                    'UPDATE pedidos SET repartidor_id = :repartidor_id, estado = :estado, updated_at = NOW()
                     WHERE id = :id'
                );
                $updatePedido->execute([
                    'repartidor_id' => $repartidorId,
                    'estado' => 'asignado',
                    'id' => $pedidoId,
                ]);
            }

            $this->pdo->commit();

            return $rutaId;
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function updateOrden(int $rutaId, array $pedidoIdsOrdenados): void
    {
        $this->pdo->beginTransaction();

        try {
            $this->pdo->prepare('DELETE FROM ruta_detalle WHERE ruta_id = :ruta_id')
                ->execute(['ruta_id' => $rutaId]);

            $orden = 1;
            foreach ($pedidoIdsOrdenados as $pedidoId) {
                $stmt = $this->pdo->prepare(
                    'INSERT INTO ruta_detalle (ruta_id, pedido_id, orden_entrega)
                     VALUES (:ruta_id, :pedido_id, :orden)'
                );
                $stmt->execute([
                    'ruta_id' => $rutaId,
                    'pedido_id' => $pedidoId,
                    'orden' => $orden++,
                ]);
            }

            $this->pdo->commit();
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function updateEstado(int $id, string $estado): bool
    {
        $stmt = $this->pdo->prepare(
            'UPDATE rutas SET estado = :estado, updated_at = NOW() WHERE id = :id'
        );

        return $stmt->execute(['estado' => $estado, 'id' => $id]);
    }

    public function delete(int $id): bool
    {
        $this->pdo->beginTransaction();

        try {
            $paradas = $this->getParadas($id);

            foreach ($paradas as $parada) {
                if ($parada['estado'] === 'asignado') {
                    $this->pdo->prepare(
                        'UPDATE pedidos SET repartidor_id = NULL, estado = :estado, updated_at = NOW()
                         WHERE id = :id'
                    )->execute(['estado' => 'pendiente', 'id' => $parada['pedido_id']]);
                }
            }

            $this->pdo->prepare('DELETE FROM ruta_detalle WHERE ruta_id = :id')->execute(['id' => $id]);
            $this->pdo->prepare('DELETE FROM rutas WHERE id = :id')->execute(['id' => $id]);

            $this->pdo->commit();

            return true;
        } catch (PDOException $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function pedidosDisponibles(?int $empresaId = null): array
    {
        $sql = "SELECT p.*, c.nombre AS cliente_nombre
                FROM pedidos p
                INNER JOIN usuarios c ON p.cliente_id = c.id
                WHERE p.estado IN ('pendiente', 'asignado')
                AND p.id NOT IN (SELECT pedido_id FROM ruta_detalle)";
        $params = [];

        if ($empresaId !== null) {
            $sql .= ' AND p.empresa_id = :empresa_id';
            $params['empresa_id'] = $empresaId;
        }

        $sql .= ' ORDER BY p.created_at DESC';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }
}
