<?php

namespace App\Services;

class JwtService
{
    private string $secret;
    private int $expiration;

    public function __construct(array $config)
    {
        $this->secret = $config['jwt_secret'];
        $this->expiration = $config['jwt_expiration'];
    }

    public function generate(array $payload): string
    {
        $header = $this->base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $now = time();

        $body = array_merge($payload, [
            'iat' => $now,
            'exp' => $now + $this->expiration,
        ]);

        $payloadEncoded = $this->base64UrlEncode(json_encode($body));
        $signature = $this->sign("$header.$payloadEncoded");

        return "$header.$payloadEncoded.$signature";
    }

    public function decode(string $token): ?object
    {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return null;
        }

        [$header, $payload, $signature] = $parts;

        if (!hash_equals($this->sign("$header.$payload"), $signature)) {
            return null;
        }

        $data = json_decode($this->base64UrlDecode($payload));

        if (!$data || !isset($data->exp) || $data->exp < time()) {
            return null;
        }

        return $data;
    }

    private function sign(string $input): string
    {
        return $this->base64UrlEncode(
            hash_hmac('sha256', $input, $this->secret, true)
        );
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;

        if ($remainder) {
            $data .= str_repeat('=', 4 - $remainder);
        }

        return base64_decode(strtr($data, '-_', '+/'));
    }
}
