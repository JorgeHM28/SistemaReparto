<?php

namespace App\Helpers;

class TenantHelper
{
    public static function empresaId(object $user): int
    {
        if (empty($user->empresa_id)) {
            Response::error('Usuario sin empresa asignada', 403);
        }

        return (int) $user->empresa_id;
    }

    public static function verifyUsuarioEmpresa(array $usuario, int $empresaId): void
    {
        if ((int) ($usuario['empresa_id'] ?? 0) !== $empresaId) {
            Response::error('No autorizado', 403);
        }
    }

    public static function verifyPedidoEmpresa(array $pedido, int $empresaId): void
    {
        if ((int) ($pedido['empresa_id'] ?? 0) !== $empresaId) {
            Response::error('No autorizado', 403);
        }
    }
}
