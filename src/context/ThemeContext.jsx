import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

/**
 * ThemeProvider manages light/dark mode across the app.
 * - Reads the saved preference from localStorage on first render.
 * - Falls back to the system prefers-color-scheme when no preference is saved.
 * - Applies a `data-theme="light" | data-theme="dark"` attribute on <html>
 *   so CSS variables and Tailwind `dark:` variants can react to it.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("expenseflow.theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("expenseflow.theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

export default ThemeContext;
