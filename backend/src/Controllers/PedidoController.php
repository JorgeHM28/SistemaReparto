<?php

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\Validator;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Models\Pedido;
use App\Models\Usuario;
use App\Services\JwtService;

class PedidoController
{
    public function __construct(
        private Pedido $pedidoModel,
        private Usuario $usuarioModel,
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

        if ($user->rol === 'cliente') {
            $filters['cliente_id'] = (int) $user->sub;
        } elseif ($user->rol === 'repartidor') {
            $filters['repartidor_id'] = (int) $user->sub;
        } elseif ($user->rol !== 'admin') {
            Response::error('No autorizado', 403);
        }

        if (!empty($_GET['estado'])) {
            $filters['estado'] = $_GET['estado'];
        }

        if (!empty($_GET['search'])) {
            $filters['search'] = $_GET['search'];
        }

        if ($user->rol === 'admin' && !empty($_GET['cliente_id'])) {
            $filters['cliente_id'] = (int) $_GET['cliente_id'];
        }

        $pedidos = $this->pedidoModel->getAll($filters);

        Response::json(['pedidos' => $pedidos]);
    }

    public function show(int $id): void
    {
        $user = $this->authUser();
        $pedido = $this->pedidoModel->findById($id);

        if (!$pedido) {
            Response::error('Pedido no encontrado', 404);
        }

        $this->verificarAcceso($user, $pedido);

        Response::json(['pedido' => $pedido]);
    }

    public function store(): void
    {
        $user = $this->authUser();
        $data = Response::body();

        $error = Validator::required($data, ['direccion_entrega', 'latitud', 'longitud']);
        if ($error) {
            Response::error($error, 422);
        }

        if ($user->rol === 'admin') {
            RoleMiddleware::handle($user, ['admin']);
            if (empty($data['cliente_id'])) {
                Response::error('cliente_id es obligatorio', 422);
            }
            $clienteId = (int) $data['cliente_id'];
        } elseif ($user->rol === 'cliente') {
            $clienteId = (int) $user->sub;
        } else {
            Response::error('No autorizado', 403);
        }

        $cliente = $this->usuarioModel->findById($clienteId);
        if (!$cliente || $cliente['rol'] !== 'cliente') {
            Response::error('Cliente inválido', 422);
        }

        $estado = 'pendiente';
        $repartidorId = null;

        if ($user->rol === 'admin') {
            if (!empty($data['repartidor_id'])) {
                $repartidor = $this->usuarioModel->findById((int) $data['repartidor_id']);
                if (!$repartidor || $repartidor['rol'] !== 'repartidor' || !(int) $repartidor['activo']) {
                    Response::error('Repartidor inválido o inactivo', 422);
                }
                $repartidorId = (int) $data['repartidor_id'];
                $estado = 'asignado';
            }

            if (!empty($data['estado'])) {
                $this->validarEstado($data['estado']);
                $estado = $data['estado'];
            }
        }

        $id = $this->pedidoModel->create([
            'cliente_id' => $clienteId,
            'repartidor_id' => $repartidorId,
            'direccion_entrega' => trim($data['direccion_entrega']),
            'latitud' => $data['latitud'],
            'longitud' => $data['longitud'],
            'estado' => $estado,
        ]);

        $pedido = $this->pedidoModel->findById($id);

        Response::json(['pedido' => $pedido, 'message' => 'Pedido creado'], 201);
    }

    public function update(int $id): void
    {
        $user = $this->authUser();
        $data = Response::body();
        $pedido = $this->pedidoModel->findById($id);

        if (!$pedido) {
            Response::error('Pedido no encontrado', 404);
        }

        $this->verificarAcceso($user, $pedido);

        $updateData = [];

        if ($user->rol === 'admin') {
            if (isset($data['direccion_entrega'])) {
                $updateData['direccion_entrega'] = trim($data['direccion_entrega']);
            }
            if (isset($data['latitud'])) {
                $updateData['latitud'] = $data['latitud'];
            }
            if (isset($data['longitud'])) {
                $updateData['longitud'] = $data['longitud'];
            }
            if (isset($data['estado'])) {
                $this->validarEstado($data['estado']);
                $updateData['estado'] = $data['estado'];
                if ($data['estado'] === 'entregado') {
                    $updateData['fecha_entrega'] = date('Y-m-d H:i:s');
                }
            }
            if (array_key_exists('repartidor_id', $data)) {
                if ($data['repartidor_id'] === null || $data['repartidor_id'] === '') {
                    $updateData['repartidor_id'] = null;
                } else {
                    $repartidor = $this->usuarioModel->findById((int) $data['repartidor_id']);
                    if (!$repartidor || $repartidor['rol'] !== 'repartidor' || !(int) $repartidor['activo']) {
                        Response::error('Repartidor inválido o inactivo', 422);
                    }
                    $updateData['repartidor_id'] = (int) $data['repartidor_id'];
                    if (!isset($updateData['estado']) && $pedido['estado'] === 'pendiente') {
                        $updateData['estado'] = 'asignado';
                    }
                }
            }
        } elseif ($user->rol === 'cliente') {
            if (isset($data['estado']) && $data['estado'] === 'cancelado') {
                if ($pedido['estado'] !== 'pendiente') {
                    Response::error('Solo podés cancelar pedidos pendientes', 422);
                }
                $updateData['estado'] = 'cancelado';
            } else {
                Response::error('No podés modificar este pedido', 403);
            }
        } elseif ($user->rol === 'repartidor') {
            if ((int) $pedido['repartidor_id'] !== (int) $user->sub) {
                Response::error('No autorizado', 403);
            }
            if (isset($data['estado'])) {
                $this->validarEstado($data['estado']);
                $permitidos = ['en_ruta', 'entregado'];
                if (!in_array($data['estado'], $permitidos, true)) {
                    Response::error('Estado no permitido para repartidor', 422);
                }
                $updateData['estado'] = $data['estado'];
                if ($data['estado'] === 'entregado') {
                    $updateData['fecha_entrega'] = date('Y-m-d H:i:s');
                }
            }
        }

        if (empty($updateData)) {
            Response::error('No hay datos para actualizar', 422);
        }

        $this->pedidoModel->update($id, $updateData);
        $pedido = $this->pedidoModel->findById($id);

        Response::json(['pedido' => $pedido, 'message' => 'Pedido actualizado']);
    }

    public function destroy(int $id): void
    {
        $user = $this->authUser();
        RoleMiddleware::handle($user, ['admin']);

        $pedido = $this->pedidoModel->findById($id);

        if (!$pedido) {
            Response::error('Pedido no encontrado', 404);
        }

        $this->pedidoModel->delete($id);

        Response::json(['message' => 'Pedido eliminado']);
    }

    private function verificarAcceso(object $user, array $pedido): void
    {
        if ($user->rol === 'admin') {
            return;
        }

        if ($user->rol === 'cliente' && (int) $pedido['cliente_id'] === (int) $user->sub) {
            return;
        }

        if ($user->rol === 'repartidor' && (int) $pedido['repartidor_id'] === (int) $user->sub) {
            return;
        }

        Response::error('No autorizado', 403);
    }

    private function validarEstado(string $estado): void
    {
        if (!in_array($estado, Pedido::estadosValidos(), true)) {
            Response::error('Estado inválido', 422);
        }
    }
}
