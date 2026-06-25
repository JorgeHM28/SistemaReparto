<?php

namespace App\Models;

use PDO;

class Empresa
{
    public function __construct(private PDO $pdo)
    {
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, nombre, slug, activo, created_at, updated_at
             FROM empresas WHERE id = :id LIMIT 1'
        );
        $stmt->execute(['id' => $id]);
        $empresa = $stmt->fetch();

        return $empresa ?: null;
    }

    public function findBySlug(string $slug): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, nombre, slug, activo, created_at, updated_at
             FROM empresas WHERE slug = :slug LIMIT 1'
        );
        $stmt->execute(['slug' => $slug]);
        $empresa = $stmt->fetch();

        return $empresa ?: null;
    }

    public function slugExists(string $slug): bool
    {
        $stmt = $this->pdo->prepare('SELECT 1 FROM empresas WHERE slug = :slug LIMIT 1');
        $stmt->execute(['slug' => $slug]);

        return (bool) $stmt->fetchColumn();
    }

    public function create(string $nombre, string $slug): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO empresas (nombre, slug, activo, created_at, updated_at)
             VALUES (:nombre, :slug, 1, NOW(), NOW())'
        );
        $stmt->execute([
            'nombre' => $nombre,
            'slug' => $slug,
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public static function generarSlug(string $nombre): string
    {
        $slug = strtolower(trim($nombre));
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        $slug = trim($slug, '-');

        return $slug !== '' ? $slug : 'empresa';
    }
}
