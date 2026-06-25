<?php

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\TenantHelper;
use App\Helpers\Validator;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;
use App\Models\Usuario;
use App\Services\JwtService;

class UsuarioController
{
    private const ROLES = ['admin', 'repartidor', 'cliente'];

    public function __construct(
        private Usuario $usuarioModel,
        private JwtService $jwt
    ) {
    }

    private function requireAdmin(): object
    {
        $user = AuthMiddleware::handle($this->jwt);
        RoleMiddleware::handle($user, ['admin']);

        return $user;
    }

    public function index(): void
    {
        $authUser = $this->requireAdmin();
        $empresaId = TenantHelper::empresaId($authUser);

        $search = $_GET['search'] ?? null;
        $rol = $_GET['rol'] ?? null;

        if ($rol && !in_array($rol, self::ROLES, true)) {
            Response::error('Rol inválido', 422);
        }

        $usuarios = $this->usuarioModel->getAll($search, $rol, $empresaId);

        Response::json(['usuarios' => $usuarios]);
    }

    public function show(int $id): void
    {
        $authUser = $this->requireAdmin();
        $empresaId = TenantHelper::empresaId($authUser);

        $usuario = $this->usuarioModel->findById($id);

        if (!$usuario) {
            Response::error('Usuario no encontrado', 404);
        }

        TenantHelper::verifyUsuarioEmpresa($usuario, $empresaId);

        Response::json(['usuario' => $usuario]);
    }

    public function store(): void
    {
        $authUser = $this->requireAdmin();
        $empresaId = TenantHelper::empresaId($authUser);
        $data = Response::body();

        $error = Validator::required($data, ['nombre', 'email', 'password', 'rol']);
        if ($error) {
            Response::error($error, 422);
        }

        if (!Validator::email($data['email'])) {
            Response::error('Email inválido', 422);
        }

        if (!in_array($data['rol'], self::ROLES, true)) {
            Response::error('Rol inválido', 422);
        }

        if ($data['rol'] === 'admin') {
            Response::error('No podés crear otro administrador desde aquí', 422);
        }

        $passwordError = Validator::password($data['password']);
        if ($passwordError) {
            Response::error($passwordError, 422);
        }

        if ($this->usuarioModel->findByEmail($data['email'])) {
            Response::error('El email ya está registrado', 409);
        }

        $id = $this->usuarioModel->create([
            'empresa_id' => $empresaId,
            'nombre' => trim($data['nombre']),
            'email' => trim($data['email']),
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
            'telefono' => $data['telefono'] ?? null,
            'rol' => $data['rol'],
            'activo' => isset($data['activo']) ? (int) $data['activo'] : 1,
        ]);

        $usuario = $this->usuarioModel->findById($id);

        Response::json(['usuario' => $usuario, 'message' => 'Usuario creado'], 201);
    }

    public function update(int $id): void
    {
        $authUser = $this->requireAdmin();
        $empresaId = TenantHelper::empresaId($authUser);
        $data = Response::body();

        $usuario = $this->usuarioModel->findById($id);

        if (!$usuario) {
            Response::error('Usuario no encontrado', 404);
        }

        TenantHelper::verifyUsuarioEmpresa($usuario, $empresaId);

        if (isset($data['email'])) {
            if (!Validator::email($data['email'])) {
                Response::error('Email inválido', 422);
            }

            $existente = $this->usuarioModel->findByEmail($data['email']);
            if ($existente && (int) $existente['id'] !== $id) {
                Response::error('El email ya está en uso', 409);
            }
        }

        if (isset($data['rol']) && !in_array($data['rol'], self::ROLES, true)) {
            Response::error('Rol inválido', 422);
        }

        if (isset($data['rol']) && $data['rol'] === 'admin' && $usuario['rol'] !== 'admin') {
            Response::error('No podés promover usuarios a administrador', 403);
        }

        if (isset($data['password']) && $data['password'] !== '') {
            $passwordError = Validator::password($data['password']);
            if ($passwordError) {
                Response::error($passwordError, 422);
            }
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        } else {
            unset($data['password']);
        }

        if ((int) $authUser->sub === $id && isset($data['rol']) && $data['rol'] !== 'admin') {
            Response::error('No podés cambiar tu propio rol de administrador', 403);
        }

        if ((int) $authUser->sub === $id && isset($data['activo']) && !(int) $data['activo']) {
            Response::error('No podés desactivarte a vos mismo', 403);
        }

        $updateData = [];

        if (isset($data['nombre'])) {
            $updateData['nombre'] = trim($data['nombre']);
        }
        if (isset($data['email'])) {
            $updateData['email'] = trim($data['email']);
        }
        if (isset($data['telefono'])) {
            $updateData['telefono'] = $data['telefono'] ?: null;
        }
        if (isset($data['rol'])) {
            $updateData['rol'] = $data['rol'];
        }
        if (isset($data['activo'])) {
            $updateData['activo'] = (int) $data['activo'];
        }
        if (isset($data['password'])) {
            $updateData['password'] = $data['password'];
        }

        $this->usuarioModel->update($id, $updateData);

        $usuario = $this->usuarioModel->findById($id);

        Response::json(['usuario' => $usuario, 'message' => 'Usuario actualizado']);
    }

    public function destroy(int $id): void
    {
        $authUser = $this->requireAdmin();
        $empresaId = TenantHelper::empresaId($authUser);

        if ((int) $authUser->sub === $id) {
            Response::error('No podés eliminarte a vos mismo', 403);
        }

        $usuario = $this->usuarioModel->findById($id);

        if (!$usuario) {
            Response::error('Usuario no encontrado', 404);
        }

        TenantHelper::verifyUsuarioEmpresa($usuario, $empresaId);

        $this->usuarioModel->delete($id);

        Response::json(['message' => 'Usuario eliminado']);
    }
}
