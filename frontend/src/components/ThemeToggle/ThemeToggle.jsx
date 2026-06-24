import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      aria-pressed={isDark}
      title={isDark ? "Modo claro" : "Modo oscuro"}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-thumb" aria-hidden="true" />
      </span>
      <span className="theme-toggle-label">{isDark ? "Oscuro" : "Claro"}</span>
    </button>
  );
}
