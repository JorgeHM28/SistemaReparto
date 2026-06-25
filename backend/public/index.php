<?php

$basePath = file_exists(dirname(__DIR__) . '/vendor/autoload.php')
    ? dirname(__DIR__)
    : '/app';

require_once $basePath . '/vendor/autoload.php';

$config = require $basePath . '/config/app.php';
require $basePath . '/config/database.php';

use App\Middleware\CorsMiddleware;
use App\Controllers\AuthController;
use App\Controllers\DashboardController;
use App\Controllers\PedidoController;
use App\Controllers\RutaController;
use App\Controllers\UbicacionController;
use App\Controllers\UsuarioController;
use App\Models\Dashboard;
use App\Models\Empresa;
use App\Models\Pedido;
use App\Models\Ruta;
use App\Models\Ubicacion;
use App\Models\Usuario;
use App\Router;
use App\Services\JwtService;
use App\Services\RouteOptimizer;

CorsMiddleware::handle($config['cors_origin']);

$jwt = new JwtService($config);
$empresaModel = new Empresa($pdo);
$usuarioModel = new Usuario($pdo);
$pedidoModel = new Pedido($pdo);
$rutaModel = new Ruta($pdo);
$ubicacionModel = new Ubicacion($pdo);
$dashboardModel = new Dashboard($pdo);
$optimizer = new RouteOptimizer();
$authController = new AuthController($usuarioModel, $empresaModel, $jwt, $pdo);
$usuarioController = new UsuarioController($usuarioModel, $jwt);
$pedidoController = new PedidoController($pedidoModel, $usuarioModel, $jwt);
$rutaController = new RutaController($rutaModel, $pedidoModel, $usuarioModel, $optimizer, $jwt);
$ubicacionController = new UbicacionController($ubicacionModel, $pedidoModel, $usuarioModel, $jwt);
$dashboardController = new DashboardController($dashboardModel, $pedidoModel, $ubicacionModel, $jwt);
$router = new Router($authController, $usuarioController, $pedidoController, $rutaController, $ubicacionController, $dashboardController, $jwt);

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$uri = preg_replace('#^/index\.php#', '', $uri) ?: '/';

$router->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', $uri);
