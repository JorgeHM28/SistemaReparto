<?php

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\Validator;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Models\Pedido;
use App\Models\Ubicacion;
use App\Services\JwtService;

class UbicacionController
{
    public function __construct(
        private Ubicacion $ubicacionModel,
        private Pedido $pedidoModel,
        private JwtService $jwt
    ) {
    }

    private function authUser(): object
    {
        return AuthMiddleware::handle($this->jwt);
    }

    public function store(): void
    {
        $user = $this->authUser();
        RoleMiddleware::handle($user, ['repartidor']);

        $data = Response::body();
        $error = Validator::required($data, ['latitud', 'longitud']);

        if ($error) {
            Response::error($error, 422);
        }

        $id = $this->ubicacionModel->create(
            (int) $user->sub,
            (float) $data['latitud'],
            (float) $data['longitud']
        );

        $ubicacion = $this->ubicacionModel->getUltima((int) $user->sub);

        Response::json(['ubicacion' => $ubicacion, 'id' => $id], 201);
    }

    public function index(): void
    {
        $user = $this->authUser();

        if (!empty($_GET['repartidor_id'])) {
            $repartidorId = (int) $_GET['repartidor_id'];

            if ($user->rol === 'cliente') {
                $this->verificarClienteRepartidor($user, $repartidorId);
            } elseif ($user->rol === 'repartidor' && (int) $user->sub !== $repartidorId) {
                Response::error('No autorizado', 403);
            } elseif ($user->rol !== 'admin' && $user->rol !== 'cliente' && $user->rol !== 'repartidor') {
                Response::error('No autorizado', 403);
            }

            $ubicacion = $this->ubicacionModel->getUltima($repartidorId);

            Response::json(['ubicacion' => $ubicacion]);
        }

        RoleMiddleware::handle($user, ['admin']);

        $ubicaciones = $this->ubicacionModel->getUltimasTodos();

        Response::json(['ubicaciones' => $ubicaciones]);
    }

    public function mapa(): void
    {
        $user = $this->authUser();
        RoleMiddleware::handle($user, ['admin']);

        $pedidos = $this->pedidoModel->getAll([
            'estado' => null,
        ]);

        $pedidosActivos = array_values(array_filter(
            $pedidos,
            fn ($p) => in_array($p['estado'], ['pendiente', 'asignado', 'en_ruta'], true)
        ));

        $ubicaciones = $this->ubicacionModel->getUltimasTodos();

        Response::json([
            'pedidos' => $pedidosActivos,
            'repartidores' => $ubicaciones,
        ]);
    }

    private function verificarClienteRepartidor(object $user, int $repartidorId): void
    {
        $pedidos = $this->pedidoModel->getAll(['cliente_id' => (int) $user->sub]);

        $tienePedidoActivo = false;

        foreach ($pedidos as $pedido) {
            if (
                (int) ($pedido['repartidor_id'] ?? 0) === $repartidorId
                && in_array($pedido['estado'], ['asignado', 'en_ruta'], true)
            ) {
                $tienePedidoActivo = true;
                break;
            }
        }

        if (!$tienePedidoActivo) {
            Response::error('No tenés un pedido activo con este repartidor', 403);
        }
    }
}
