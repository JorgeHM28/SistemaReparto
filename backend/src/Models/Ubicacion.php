<?php

namespace App\Models;

use PDO;

class Ubicacion
{
    public function __construct(private PDO $pdo)
    {
    }

    public function create(int $repartidorId, float $latitud, float $longitud): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO ubicaciones (repartidor_id, latitud, longitud, fecha_hora)
             VALUES (:repartidor_id, :latitud, :longitud, NOW())'
        );
        $stmt->execute([
            'repartidor_id' => $repartidorId,
            'latitud' => $latitud,
            'longitud' => $longitud,
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public function getUltima(int $repartidorId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT ub.*, u.nombre AS repartidor_nombre
             FROM ubicaciones ub
             INNER JOIN usuarios u ON ub.repartidor_id = u.id
             WHERE ub.repartidor_id = :repartidor_id
             ORDER BY ub.fecha_hora DESC
             LIMIT 1'
        );
        $stmt->execute(['repartidor_id' => $repartidorId]);
        $row = $stmt->fetch();

        return $row ?: null;
    }

    public function getUltimasTodos(?int $empresaId = null): array
    {
        $sql = 'SELECT ub.*, u.nombre AS repartidor_nombre, u.email AS repartidor_email
                FROM ubicaciones ub
                INNER JOIN usuarios u ON ub.repartidor_id = u.id
                INNER JOIN (
                    SELECT repartidor_id, MAX(fecha_hora) AS max_fecha
                    FROM ubicaciones
                    GROUP BY repartidor_id
                ) latest ON ub.repartidor_id = latest.repartidor_id
                        AND ub.fecha_hora = latest.max_fecha
                WHERE u.rol = \'repartidor\' AND u.activo = 1';
        $params = [];

        if ($empresaId !== null) {
            $sql .= ' AND u.empresa_id = :empresa_id';
            $params['empresa_id'] = $empresaId;
        }

        $sql .= ' ORDER BY u.nombre ASC';

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function getHistorial(int $repartidorId, int $limit = 50): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM ubicaciones
             WHERE repartidor_id = :repartidor_id
             ORDER BY fecha_hora DESC
             LIMIT :limit'
        );
        $stmt->bindValue('repartidor_id', $repartidorId, PDO::PARAM_INT);
        $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }
}
