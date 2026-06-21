import { useEffect, useRef, useState } from "react";

export function useGeolocationTracker(onLocation, enabled = false, intervalMs = 3000) {
  const [activo, setActivo] = useState(false);
  const [error, setError] = useState(null);
  const ultimoEnvio = useRef(0);
  const watchId = useRef(null);
  const callbackRef = useRef(onLocation);

  useEffect(() => {
    callbackRef.current = onLocation;
  }, [onLocation]);

  useEffect(() => {
    if (!enabled) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      setActivo(false);
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocalización no disponible en este navegador");
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setActivo(true);
        setError(null);

        const ahora = Date.now();
        if (ahora - ultimoEnvio.current >= intervalMs) {
          ultimoEnvio.current = ahora;
          callbackRef.current(pos.coords.latitude, pos.coords.longitude);
        }
      },
      (err) => {
        setError(err.message || "Error al obtener ubicación");
        setActivo(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [enabled, intervalMs]);

  return { activo, error };
}
