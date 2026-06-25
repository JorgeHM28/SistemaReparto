<?php

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\TenantHelper;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Models\Dashboard;
use App\Models\Pedido;
use App\Models\Ubicacion;
use App\Services\JwtService;

class DashboardController
{
    public function __construct(
        private Dashboard $dashboardModel,
        private Pedido $pedidoModel,
        private Ubicacion $ubicacionModel,
        private JwtService $jwt
    ) {
    }

    private function authUser(): object
    {
        return AuthMiddleware::handle($this->jwt);
    }

    public function admin(): void
    {
        $user = $this->authUser();
        RoleMiddleware::handle($user, ['admin']);
        $empresaId = TenantHelper::empresaId($user);

        $stats = $this->dashboardModel->statsAdmin($empresaId);

        $pedidos = $this->pedidoModel->getAll(['empresa_id' => $empresaId]);
        $pedidosActivos = array_values(array_filter(
            $pedidos,
            fn ($p) => in_array($p['estado'], ['pendiente', 'asignado', 'en_ruta'], true)
        ));

        $repartidores = $this->ubicacionModel->getUltimasTodos($empresaId);

        Response::json([
            'stats' => $stats,
            'mapa' => [
                'pedidos' => $pedidosActivos,
                'repartidores' => $repartidores,
            ],
        ]);
    }

    public function cliente(): void
    {
        $user = $this->authUser();
        RoleMiddleware::handle($user, ['cliente']);

        $stats = $this->dashboardModel->statsCliente((int) $user->sub);

        Response::json(['stats' => $stats]);
    }

    public function repartidor(): void
    {
        $user = $this->authUser();
        RoleMiddleware::handle($user, ['repartidor']);

        $stats = $this->dashboardModel->statsRepartidor((int) $user->sub);

        Response::json(['stats' => $stats]);
    }

    public function reportes(): void
    {
        $user = $this->authUser();
        RoleMiddleware::handle($user, ['admin']);
        $empresaId = TenantHelper::empresaId($user);

        $data = $this->dashboardModel->reportes($empresaId);

        Response::json($data);
    }
}
