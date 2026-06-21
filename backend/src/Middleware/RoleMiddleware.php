<?php

namespace App\Middleware;

use App\Helpers\Response;

class RoleMiddleware
{
    public static function handle(object $user, array $roles): void
    {
        if (!in_array($user->rol, $roles, true)) {
            Response::error('No tenés permisos para acceder a este recurso', 403);
        }
    }
}
