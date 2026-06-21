<?php

namespace App\Services;

class RouteOptimizer
{
    public function vecinoMasCercano(array $pedidos, float $startLat, float $startLng): array
    {
        $remaining = $pedidos;
        $ordered = [];
        $currentLat = $startLat;
        $currentLng = $startLng;

        while (!empty($remaining)) {
            $nearestKey = null;
            $nearestDist = PHP_FLOAT_MAX;

            foreach ($remaining as $key => $pedido) {
                $dist = $this->distancia(
                    $currentLat,
                    $currentLng,
                    (float) $pedido['latitud'],
                    (float) $pedido['longitud']
                );

                if ($dist < $nearestDist) {
                    $nearestDist = $dist;
                    $nearestKey = $key;
                }
            }

            $nearest = $remaining[$nearestKey];
            $ordered[] = $nearest;
            $currentLat = (float) $nearest['latitud'];
            $currentLng = (float) $nearest['longitud'];
            unset($remaining[$nearestKey]);
        }

        return $ordered;
    }

    private function distancia(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
