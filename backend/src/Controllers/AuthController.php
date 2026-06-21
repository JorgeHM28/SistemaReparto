<?php

namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\Validator;
use App\Models\Usuario;
use App\Services\JwtService;

class AuthController
{
    public function __construct(
        private Usuario $usuarioModel,
        private JwtService $jwt
    ) {
    }

    public function login(): void
    {
        $data = Response::body();

        $error = Validator::required($data, ['email', 'password']);
        if ($error) {
            Response::error($error, 422);
        }

        if (!Validator::email($data['email'])) {
            Response::error('Email inválido', 422);
        }

        $user = $this->usuarioModel->findByEmail($data['email']);

        if (!$user || !password_verify($data['password'], $user['password'])) {
            Response::error('Credenciales incorrectas', 401);
        }

        if (isset($user['activo']) && !(int) $user['activo']) {
            Response::error('Usuario desactivado', 403);
        }

        $token = $this->jwt->generate([
            'sub' => (int) $user['id'],
            'email' => $user['email'],
            'rol' => $user['rol'],
            'nombre' => $user['nombre'],
        ]);

        Response::json([
            'token' => $token,
            'usuario' => $this->formatUser($user),
        ]);
    }

    public function register(): void
    {
        $data = Response::body();

        $error = Validator::required($data, ['nombre', 'email', 'password']);
        if ($error) {
            Response::error($error, 422);
        }

        if (!Validator::email($data['email'])) {
            Response::error('Email inválido', 422);
        }

        $passwordError = Validator::password($data['password']);
        if ($passwordError) {
            Response::error($passwordError, 422);
        }

        if ($this->usuarioModel->findByEmail($data['email'])) {
            Response::error('El email ya está registrado', 409);
        }

        $id = $this->usuarioModel->create([
            'nombre' => trim($data['nombre']),
            'email' => trim($data['email']),
            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
            'telefono' => $data['telefono'] ?? null,
            'rol' => 'cliente',
        ]);

        $user = $this->usuarioModel->findById($id);

        $token = $this->jwt->generate([
            'sub' => $id,
            'email' => $user['email'],
            'rol' => $user['rol'],
            'nombre' => $user['nombre'],
        ]);

        Response::json([
            'token' => $token,
            'usuario' => $user,
        ], 201);
    }

    public function logout(): void
    {
        Response::json(['message' => 'Sesión cerrada correctamente']);
    }

    public function me(object $authUser): void
    {
        $user = $this->usuarioModel->findById((int) $authUser->sub);

        if (!$user) {
            Response::error('Usuario no encontrado', 404);
        }

        Response::json(['usuario' => $user]);
    }

    public function recuperarPassword(): void
    {
        $data = Response::body();

        $error = Validator::required($data, ['email']);
        if ($error) {
            Response::error($error, 422);
        }

        if (!Validator::email($data['email'])) {
            Response::error('Email inválido', 422);
        }

        $user = $this->usuarioModel->findByEmail($data['email']);

        $token = null;

        if ($user) {
            $token = bin2hex(random_bytes(32));
            $expires = date('Y-m-d H:i:s', time() + 3600);
            $this->usuarioModel->setResetToken((int) $user['id'], $token, $expires);
        }

        $response = [
            'message' => 'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
        ];

        if ($user && (getenv('APP_ENV') === 'development' || getenv('APP_DEBUG') === 'true')) {
            $response['dev_token'] = $token;
        }

        Response::json($response);
    }

    public function restablecerPassword(): void
    {
        $data = Response::body();

        $error = Validator::required($data, ['token', 'password']);
        if ($error) {
            Response::error($error, 422);
        }

        $passwordError = Validator::password($data['password']);
        if ($passwordError) {
            Response::error($passwordError, 422);
        }

        $user = $this->usuarioModel->findByResetToken($data['token']);

        if (!$user) {
            Response::error('Token inválido o expirado', 400);
        }

        $this->usuarioModel->updatePassword(
            (int) $user['id'],
            password_hash($data['password'], PASSWORD_DEFAULT)
        );

        Response::json(['message' => 'Contraseña actualizada correctamente']);
    }

    private function formatUser(array $user): array
    {
        unset($user['password'], $user['reset_token'], $user['reset_token_expires']);

        return $user;
    }
}
