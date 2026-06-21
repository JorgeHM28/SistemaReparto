<?php

namespace App\Helpers;

class Validator
{
    public static function required(array $data, array $fields): ?string
    {
        foreach ($fields as $field) {
            if (!isset($data[$field])) {
                return "El campo '$field' es obligatorio";
            }

            if (is_array($data[$field])) {
                if (empty($data[$field])) {
                    return "El campo '$field' es obligatorio";
                }
                continue;
            }

            if (trim((string) $data[$field]) === '') {
                return "El campo '$field' es obligatorio";
            }
        }

        return null;
    }

    public static function email(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function password(string $password): ?string
    {
        if (strlen($password) < 6) {
            return 'La contraseña debe tener al menos 6 caracteres';
        }

        return null;
    }
}
