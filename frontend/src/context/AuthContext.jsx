import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

const STORAGE_KEY = "sistema_repartos_auth";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const guardado = localStorage.getItem(STORAGE_KEY);

    if (guardado) {
      try {
        const { token: t, usuario: u } = JSON.parse(guardado);
        setToken(t);
        setUsuario(u);
        authService.me()
          .then(({ data }) => setUsuario(data.usuario))
          .catch(() => {
            localStorage.removeItem(STORAGE_KEY);
            setToken(null);
            setUsuario(null);
          });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    setCargando(false);
  }, []);

  const persistir = (t, u) => {
    setToken(t);
    setUsuario(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: t, usuario: u }));
  };

  const login = async (credenciales) => {
    const { data } = await authService.login(credenciales);
    persistir(data.token, data.usuario);
    return data.usuario;
  };

  const register = async (datos) => {
    const { data } = await authService.register(datos);
    persistir(data.token, data.usuario);
    return data.usuario;
  };

  const logout = async () => {
    try {
      if (token) await authService.logout();
    } catch {
      // Ignorar error de logout en servidor
    } finally {
      setUsuario(null);
      setToken(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        cargando,
        login,
        register,
        logout,
        estaAutenticado: !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}

export function rutaPorRol(rol) {
  const rutas = {
    admin: "/admin",
    cliente: "/cliente",
    repartidor: "/repartidor",
  };

  return rutas[rol] || "/";
}
