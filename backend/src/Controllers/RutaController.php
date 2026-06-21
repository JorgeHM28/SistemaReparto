<?php

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\Validator;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Models\Pedido;
use App\Models\Ruta;
use App\Models\Usuario;
use App\Services\JwtService;
use App\Services\RouteOptimizer;

class RutaController
{
    public function __construct(
        private Ruta $rutaModel,
        private Pedido $pedidoModel,
        private Usuario $usuarioModel,
        private RouteOptimizer $optimizer,
        private JwtService $jwt
    ) {
    }

    private function authUser(): object
    {
        return AuthMiddleware::handle($this->jwt);
    }

    public function index(): void
    {
        $user = $this->authUser();
        $filters = [];

        if ($user->rol === 'repartidor') {
            $filters['repartidor_id'] = (int) $user->sub;
        } elseif ($user->rol !== 'admin') {
            Response::error('No autorizado', 403);
        }

        if (!empty($_GET['estado'])) {
            $filters['estado'] = $_GET['estado'];
        }

        if (!empty($_GET['fecha'])) {
            $filters['fecha'] = $_GET['fecha'];
        }

        $rutas = $this->rutaModel->getAll($filters);

        Response::json(['rutas' => $rutas]);
    }

    public function disponibles(): void
    {
        $user = $this->authUser();
        RoleMiddleware::handle($user, ['admin']);

        $pedidos = $this->rutaModel->pedidosDisponibles();

        Response::json(['pedidos' => $pedidos]);
    }

    public function activa(): void
    {
        $user = $this->authUser();
        RoleMiddleware::handle($user, ['repartidor']);

        $rutas = $this->rutaModel->getAll([
            'repartidor_id' => (int) $user->sub,
            'fecha' => date('Y-m-d'),
        ]);

        $rutaActiva = null;

        foreach ($rutas as $ruta) {
            if (in_array($ruta['estado'], ['pendiente', 'en_proceso'], true)) {
                $rutaActiva = $ruta;
                break;
            }
        }

        if (!$rutaActiva && !empty($rutas)) {
            $rutaActiva = $rutas[0];
        }

        if (!$rutaActiva) {
            Response::json(['ruta' => null, 'paradas' => [], 'siguiente_entrega' => null]);
        }

        $this->responderConDetalle((int) $rutaActiva['id'], $user);
    }

    public function show(int $id): void
    {
        $user = $this->authUser();
        $ruta = $this->rutaModel->findById($id);

        if (!$ruta) {
            Response::error('Ruta no encontrada', 404);
        }

        $this->verificarAcceso($user, $ruta);
        $this->responderConDetalle($id, $user);
    }

    public function store(): void
    {
        $user = $this->authUser();
        RoleMiddleware::handle($user, ['admin']);

        $data = Response::body();
        $error = Validator::required($data, ['repartidor_id', 'fecha', 'pedido_ids']);

        if ($error) {
            Response::error($error, 422);
        }

        if (!is_array($data['pedido_ids']) || empty($data['pedido_ids'])) {
            Response::error('Debe incluir al menos un pedido', 422);
        }

        $repartidor = $this->usuarioModel->findById((int) $data['repartidor_id']);

        if (!$repartidor || $repartidor['rol'] !== 'repartidor' || !(int) $repartidor['activo']) {
            Response::error('Repartidor inválido o inactivo', 422);
        }

        $pedidoIds = array_map('intval', $data['pedido_ids']);

        foreach ($pedidoIds as $pedidoId) {
            $pedido = $this->pedidoModel->findById($pedidoId);

            if (!$pedido) {
                Response::error("Pedido #$pedidoId no encontrado", 404);
            }

            if (!in_array($pedido['estado'], ['pendiente', 'asignado'], true)) {
                Response::error("Pedido #$pedidoId no está disponible", 422);
            }
        }

        $rutaId = $this->rutaModel->createWithPedidos(
            (int) $data['repartidor_id'],
            $data['fecha'],
            $pedidoIds
        );

        $this->responderConDetalle($rutaId, $user, 201);
    }

    public function update(int $id): void
    {
        $user = $this->authUser();
        $data = Response::body();
        $ruta = $this->rutaModel->findById($id);

        if (!$ruta) {
            Response::error('Ruta no encontrada', 404);
        }

        if ($user->rol === 'admin') {
            if (isset($data['estado'])) {
                if (!in_array($data['estado'], Ruta::estadosValidos(), true)) {
                    Response::error('Estado inválido', 422);
                }
                $this->rutaModel->updateEstado($id, $data['estado']);
            }
        } elseif ($user->rol === 'repartidor') {
            $this->verificarAcceso($user, $ruta);

            if (isset($data['estado']) && $data['estado'] === 'en_proceso') {
                $this->rutaModel->updateEstado($id, 'en_proceso');
            } elseif (isset($data['estado']) && $data['estado'] === 'finalizada') {
                $this->rutaModel->updateEstado($id, 'finalizada');
            } else {
                Response::error('Acción no permitida', 403);
            }
        } else {
            Response::error('No autorizado', 403);
        }

        $this->responderConDetalle($id, $user);
    }

    public function optimizar(int $id): void
    {
        $user = $this->authUser();
        RoleMiddleware::handle($user, ['admin']);

        $ruta = $this->rutaModel->findById($id);

        if (!$ruta) {
            Response::error('Ruta no encontrada', 404);
        }

        $paradas = $this->rutaModel->getParadas($id);

        if (count($paradas) < 2) {
            Response::error('Se necesitan al menos 2 pedidos para optimizar', 422);
        }

        $data = Response::body();
        $startLat = isset($data['latitud_inicio']) ? (float) $data['latitud_inicio'] : (float) $paradas[0]['latitud'];
        $startLng = isset($data['longitud_inicio']) ? (float) $data['longitud_inicio'] : (float) $paradas[0]['longitud'];

        $ordenados = $this->optimizer->vecinoMasCercano($paradas, $startLat, $startLng);
        $pedidoIds = array_column($ordenados, 'pedido_id');

        $this->rutaModel->updateOrden($id, $pedidoIds);

        $this->responderConDetalle($id, $user);
    }

    public function destroy(int $id): void
    {
        $user = $this->authUser();
        RoleMiddleware::handle($user, ['admin']);

        $ruta = $this->rutaModel->findById($id);

        if (!$ruta) {
            Response::error('Ruta no encontrada', 404);
        }

        $this->rutaModel->delete($id);

        Response::json(['message' => 'Ruta eliminada']);
    }

    private function verificarAcceso(object $user, array $ruta): void
    {
        if ($user->rol === 'admin') {
            return;
        }

        if ($user->rol === 'repartidor' && (int) $ruta['repartidor_id'] === (int) $user->sub) {
            return;
        }

        Response::error('No autorizado', 403);
    }

    private function responderConDetalle(int $id, object $user, int $status = 200): void
    {
        $ruta = $this->rutaModel->findById($id);
        $paradas = $this->rutaModel->getParadas($id);

        $siguiente = null;
        foreach ($paradas as $parada) {
            if (!in_array($parada['estado'], ['entregado', 'cancelado'], true)) {
                $siguiente = $parada;
                break;
            }
        }

        Response::json([
            'ruta' => $ruta,
            'paradas' => $paradas,
            'siguiente_entrega' => $siguiente,
        ], $status);
    }
}
