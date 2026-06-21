<?php

namespace App\Middleware;

use App\Helpers\Response;
use App\Services\JwtService;

class AuthMiddleware
{
    public static function handle(JwtService $jwt): ?object
    {
        $header = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? '';

        if (!preg_match('/Bearer\s+(\S+)/', $header, $matches)) {
            Response::error('Token no proporcionado', 401);
        }

        $payload = $jwt->decode($matches[1]);

        if (!$payload || !isset($payload->sub)) {
            Response::error('Token inválido o expirado', 401);
        }

        return $payload;
    }
}
