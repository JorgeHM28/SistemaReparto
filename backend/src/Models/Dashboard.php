<?php

namespace App\Models;

use PDO;

class Dashboard
{
    public function __construct(private PDO $pdo)
    {
    }

    public function statsAdmin(int $empresaId): array
    {
        return [
            'pedidos_pendientes' => $this->countPedidos(['empresa_id' => $empresaId, 'estado' => 'pendiente']),
            'pedidos_entregados' => $this->countPedidos(['empresa_id' => $empresaId, 'estado' => 'entregado']),
            'pedidos_del_dia' => $this->countPedidos(['empresa_id' => $empresaId, 'hoy' => true]),
            'repartidores_activos' => $this->countRepartidoresActivos($empresaId),
            'pedidos_en_ruta' => $this->countPedidos(['empresa_id' => $empresaId, 'estado' => 'en_ruta']),
            'pedidos_cancelados' => $this->countPedidos(['empresa_id' => $empresaId, 'estado' => 'cancelado']),
        ];
    }

    public function statsCliente(int $clienteId): array
    {
        return [
            'total_pedidos' => $this->countPedidos(['cliente_id' => $clienteId]),
            'pendientes' => $this->countPedidos(['cliente_id' => $clienteId, 'estado' => 'pendiente']),
            'en_camino' => $this->countPedidosEnCamino($clienteId),
            'entregados' => $this->countPedidos(['cliente_id' => $clienteId, 'estado' => 'entregado']),
            'recientes' => $this->pedidosRecientes($clienteId, 5),
            'pedido_activo' => $this->pedidoActivoCliente($clienteId),
        ];
    }

    public function statsRepartidor(int $repartidorId): array
    {
        return [
            'entregas_pendientes' => $this->countPedidos([
                'repartidor_id' => $repartidorId,
                'estados' => ['asignado', 'en_ruta'],
            ]),
            'entregadas_hoy' => $this->countEntregadasHoy($repartidorId),
            'ruta_activa' => $this->rutaActivaRepartidor($repartidorId),
            'siguiente_entrega' => $this->siguienteEntregaRepartidor($repartidorId),
            'entregas_recientes' => $this->entregasRecientesRepartidor($repartidorId, 5),
        ];
    }

    public function reportes(int $empresaId): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT
                COUNT(*) AS total_pedidos,
                SUM(estado = 'entregado') AS entregados,
                SUM(estado = 'cancelado') AS cancelados,
                SUM(estado = 'pendiente') AS pendientes,
                SUM(estado = 'en_ruta') AS en_ruta,
                SUM(DATE(created_at) = CURDATE()) AS pedidos_hoy,
                SUM(estado = 'entregado' AND DATE(fecha_entrega) = CURDATE()) AS entregados_hoy
             FROM pedidos
             WHERE empresa_id = :empresa_id"
        );
        $stmt->execute(['empresa_id' => $empresaId]);
        $generales = $stmt->fetch();

        $porRepartidor = $this->pdo->prepare(
            "SELECT u.id, u.nombre, u.email,
                    COUNT(p.id) AS total_asignados,
                    SUM(p.estado = 'entregado') AS entregados,
                    SUM(p.estado = 'cancelado') AS cancelados,
                    SUM(p.estado IN ('asignado', 'en_ruta')) AS pendientes
             FROM usuarios u
             LEFT JOIN pedidos p ON p.repartidor_id = u.id AND p.empresa_id = :empresa_id
             WHERE u.rol = 'repartidor' AND u.empresa_id = :empresa_id2
             GROUP BY u.id, u.nombre, u.email
             ORDER BY entregados DESC"
        );
        $porRepartidor->execute(['empresa_id' => $empresaId, 'empresa_id2' => $empresaId]);
        $porRepartidorRows = $porRepartidor->fetchAll();

        $porEstado = $this->pdo->prepare(
            "SELECT estado, COUNT(*) AS cantidad
             FROM pedidos
             WHERE empresa_id = :empresa_id
             GROUP BY estado
             ORDER BY cantidad DESC"
        );
        $porEstado->execute(['empresa_id' => $empresaId]);
        $porEstadoRows = $porEstado->fetchAll();

        $ultimosEntregados = $this->pdo->prepare(
            "SELECT p.*, c.nombre AS cliente_nombre, r.nombre AS repartidor_nombre
             FROM pedidos p
             INNER JOIN usuarios c ON p.cliente_id = c.id
             LEFT JOIN usuarios r ON p.repartidor_id = r.id
             WHERE p.estado = 'entregado' AND p.empresa_id = :empresa_id
             ORDER BY p.fecha_entrega DESC
             LIMIT 10"
        );
        $ultimosEntregados->execute(['empresa_id' => $empresaId]);
        $ultimosEntregadosRows = $ultimosEntregados->fetchAll();

        $ultimosCancelados = $this->pdo->prepare(
            "SELECT p.*, c.nombre AS cliente_nombre
             FROM pedidos p
             INNER JOIN usuarios c ON p.cliente_id = c.id
             WHERE p.estado = 'cancelado' AND p.empresa_id = :empresa_id
             ORDER BY p.updated_at DESC
             LIMIT 10"
        );
        $ultimosCancelados->execute(['empresa_id' => $empresaId]);
        $ultimosCanceladosRows = $ultimosCancelados->fetchAll();

        return [
            'generales' => $generales,
            'por_repartidor' => $porRepartidorRows,
            'por_estado' => $porEstadoRows,
            'ultimos_entregados' => $ultimosEntregadosRows,
            'ultimos_cancelados' => $ultimosCanceladosRows,
        ];
    }

    private function countPedidos(array $filters): int
    {
        $sql = 'SELECT COUNT(*) FROM pedidos WHERE 1=1';
        $params = [];

        if (!empty($filters['empresa_id'])) {
            $sql .= ' AND empresa_id = :empresa_id';
            $params['empresa_id'] = $filters['empresa_id'];
        }

        if (!empty($filters['estado'])) {
            $sql .= ' AND estado = :estado';
            $params['estado'] = $filters['estado'];
        }

        if (!empty($filters['estados'])) {
            $placeholders = implode(',', array_fill(0, count($filters['estados']), '?'));
            $sql .= " AND estado IN ($placeholders)";
            if (!empty($filters['empresa_id'])) {
                $sql .= ' AND empresa_id = ?';
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute(array_merge([$filters['empresa_id']], $filters['estados']));
                return (int) $stmt->fetchColumn();
            }
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($filters['estados']);
            return (int) $stmt->fetchColumn();
        }

        if (!empty($filters['cliente_id'])) {
            $sql .= ' AND cliente_id = :cliente_id';
            $params['cliente_id'] = $filters['cliente_id'];
        }

        if (!empty($filters['repartidor_id'])) {
            $sql .= ' AND repartidor_id = :repartidor_id';
            $params['repartidor_id'] = $filters['repartidor_id'];
        }

        if (!empty($filters['hoy'])) {
            $sql .= ' AND DATE(created_at) = CURDATE()';
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return (int) $stmt->fetchColumn();
    }

    private function countRepartidoresActivos(int $empresaId): int
    {
        $stmt = $this->pdo->prepare(
            "SELECT COUNT(*) FROM usuarios WHERE rol = 'repartidor' AND activo = 1 AND empresa_id = :empresa_id"
        );
        $stmt->execute(['empresa_id' => $empresaId]);

        return (int) $stmt->fetchColumn();
    }

    private function countPedidosEnCamino(int $clienteId): int
    {
        $stmt = $this->pdo->prepare(
            "SELECT COUNT(*) FROM pedidos
             WHERE cliente_id = :cliente_id AND estado IN ('asignado', 'en_ruta')"
        );
        $stmt->execute(['cliente_id' => $clienteId]);

        return (int) $stmt->fetchColumn();
    }

    private function pedidosRecientes(int $clienteId, int $limit): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT p.*, r.nombre AS repartidor_nombre
             FROM pedidos p
             LEFT JOIN usuarios r ON p.repartidor_id = r.id
             WHERE p.cliente_id = :cliente_id
             ORDER BY p.created_at DESC
             LIMIT :limit"
        );
        $stmt->bindValue('cliente_id', $clienteId, PDO::PARAM_INT);
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    private function pedidoActivoCliente(int $clienteId): ?array
    {
        $stmt = $this->pdo->prepare(
            "SELECT p.*, r.nombre AS repartidor_nombre
             FROM pedidos p
             LEFT JOIN usuarios r ON p.repartidor_id = r.id
             WHERE p.cliente_id = :cliente_id AND p.estado IN ('asignado', 'en_ruta')
             ORDER BY p.created_at DESC
             LIMIT 1"
        );
        $stmt->execute(['cliente_id' => $clienteId]);
        $row = $stmt->fetch();

        return $row ?: null;
    }

    private function countEntregadasHoy(int $repartidorId): int
    {
        $stmt = $this->pdo->prepare(
            "SELECT COUNT(*) FROM pedidos
             WHERE repartidor_id = :repartidor_id
             AND estado = 'entregado'
             AND DATE(fecha_entrega) = CURDATE()"
        );
        $stmt->execute(['repartidor_id' => $repartidorId]);

        return (int) $stmt->fetchColumn();
    }

    private function rutaActivaRepartidor(int $repartidorId): ?array
    {
        $stmt = $this->pdo->prepare(
            "SELECT r.*,
                    (SELECT COUNT(*) FROM ruta_detalle rd WHERE rd.ruta_id = r.id) AS total_paradas
             FROM rutas r
             WHERE r.repartidor_id = :repartidor_id
             AND r.fecha = CURDATE()
             AND r.estado IN ('pendiente', 'en_proceso')
             ORDER BY r.created_at DESC
             LIMIT 1"
        );
        $stmt->execute(['repartidor_id' => $repartidorId]);
        $row = $stmt->fetch();

        return $row ?: null;
    }

    private function siguienteEntregaRepartidor(int $repartidorId): ?array
    {
        $stmt = $this->pdo->prepare(
            "SELECT p.*, c.nombre AS cliente_nombre, rd.orden_entrega
             FROM pedidos p
             INNER JOIN usuarios c ON p.cliente_id = c.id
             LEFT JOIN ruta_detalle rd ON rd.pedido_id = p.id
             WHERE p.repartidor_id = :repartidor_id
             AND p.estado IN ('asignado', 'en_ruta')
             ORDER BY rd.orden_entrega ASC, p.created_at ASC
             LIMIT 1"
        );
        $stmt->execute(['repartidor_id' => $repartidorId]);
        $row = $stmt->fetch();

        return $row ?: null;
    }

    private function entregasRecientesRepartidor(int $repartidorId, int $limit): array
    {
        $stmt = $this->pdo->prepare(
            "SELECT p.*, c.nombre AS cliente_nombre
             FROM pedidos p
             INNER JOIN usuarios c ON p.cliente_id = c.id
             WHERE p.repartidor_id = :repartidor_id
             ORDER BY p.updated_at DESC
             LIMIT :limit"
        );
        $stmt->bindValue('repartidor_id', $repartidorId, PDO::PARAM_INT);
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }
}
