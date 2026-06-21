<?php

return [
    'jwt_secret' => getenv('JWT_SECRET') ?: 'sistema_repartos_jwt_secret_dev',
    'jwt_expiration' => 86400,
    'cors_origin' => getenv('CORS_ORIGIN') ?: 'http://localhost:5173',
];
