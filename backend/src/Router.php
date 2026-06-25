<?php

namespace App;

use App\Controllers\AuthController;
use App\Controllers\PedidoController;
use App\Controllers\RutaController;
use App\Controllers\UsuarioController;
use App\Helpers\Response;
use App\Middleware\AuthMiddleware;

class Router
{
    public function __construct(
        private AuthController $auth,
        private UsuarioController $usuarios,
        private PedidoController $pedidos,
        private RutaController $rutas,
        private \App\Controllers\UbicacionController $ubicaciones,
        private \App\Controllers\DashboardController $dashboard,
        private \App\Services\JwtService $jwt
    ) {
    }

    public function dispatch(string $method, string $uri): void
    {
        $uri = '/' . trim($uri, '/');

        if ($uri === '/' && $method === 'GET') {
            Response::json(['message' => 'API Sistema Repartos funcionando', 'version' => '1.0']);
        }

        if ($method === 'POST' && $uri === '/auth/login') {
            $this->auth->login();
        }

        if ($method === 'POST' && $uri === '/auth/register') {
            $this->auth->register();
        }

        if ($method === 'POST' && $uri === '/auth/register-empresa') {
            $this->auth->registerEmpresa();
        }

        if ($method === 'POST' && $uri === '/auth/logout') {
            AuthMiddleware::handle($this->jwt);
            $this->auth->logout();
        }

        if ($method === 'GET' && $uri === '/auth/me') {
            $user = AuthMiddleware::handle($this->jwt);
            $this->auth->me($user);
        }

        if ($method === 'POST' && $uri === '/auth/recuperar-password') {
            $this->auth->recuperarPassword();
        }

        if ($method === 'POST' && $uri === '/auth/restablecer-password') {
            $this->auth->restablecerPassword();
        }

        if ($method === 'GET' && $uri === '/usuarios') {
            $this->usuarios->index();
        }

        if ($method === 'POST' && $uri === '/usuarios') {
            $this->usuarios->store();
        }

        if (preg_match('#^/usuarios/(\d+)$#', $uri, $matches)) {
            $id = (int) $matches[1];

            if ($method === 'GET') {
                $this->usuarios->show($id);
            }

            if ($method === 'PUT') {
                $this->usuarios->update($id);
            }

            if ($method === 'DELETE') {
                $this->usuarios->destroy($id);
            }
        }

        if ($method === 'GET' && $uri === '/pedidos') {
            $this->pedidos->index();
        }

        if ($method === 'POST' && $uri === '/pedidos') {
            $this->pedidos->store();
        }

        if (preg_match('#^/pedidos/(\d+)$#', $uri, $matches)) {
            $id = (int) $matches[1];

            if ($method === 'GET') {
                $this->pedidos->show($id);
            }

            if ($method === 'PUT') {
                $this->pedidos->update($id);
            }

            if ($method === 'DELETE') {
                $this->pedidos->destroy($id);
            }
        }

        if ($method === 'GET' && $uri === '/rutas') {
            $this->rutas->index();
        }

        if ($method === 'GET' && $uri === '/rutas/disponibles') {
            $this->rutas->disponibles();
        }

        if ($method === 'GET' && $uri === '/rutas/activa') {
            $this->rutas->activa();
        }

        if ($method === 'POST' && $uri === '/rutas') {
            $this->rutas->store();
        }

        if (preg_match('#^/rutas/(\d+)/optimizar$#', $uri, $matches)) {
            if ($method === 'POST') {
                $this->rutas->optimizar((int) $matches[1]);
            }
        }

        if (preg_match('#^/rutas/(\d+)$#', $uri, $matches)) {
            $id = (int) $matches[1];

            if ($method === 'GET') {
                $this->rutas->show($id);
            }

            if ($method === 'PUT') {
                $this->rutas->update($id);
            }

            if ($method === 'DELETE') {
                $this->rutas->destroy($id);
            }
        }

        if ($method === 'POST' && $uri === '/ubicaciones') {
            $this->ubicaciones->store();
        }

        if ($method === 'GET' && $uri === '/ubicaciones') {
            $this->ubicaciones->index();
        }

        if ($method === 'GET' && $uri === '/ubicaciones/mapa') {
            $this->ubicaciones->mapa();
        }

        if ($method === 'GET' && $uri === '/dashboard/admin') {
            $this->dashboard->admin();
        }

        if ($method === 'GET' && $uri === '/dashboard/cliente') {
            $this->dashboard->cliente();
        }

        if ($method === 'GET' && $uri === '/dashboard/repartidor') {
            $this->dashboard->repartidor();
        }

        if ($method === 'GET' && $uri === '/reportes') {
            $this->dashboard->reportes();
        }

        Response::error('Ruta no encontrada', 404);
    }
}
