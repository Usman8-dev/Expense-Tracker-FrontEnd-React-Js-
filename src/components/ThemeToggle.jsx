import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/**
 * ThemeToggle - a small icon button that switches between light and dark mode.
 * Shows a Moon icon in dark mode (inviting the user to switch to light) and
 * a Sun icon in light mode.
 */
export default function ThemeToggle({ className = "" }) {
  const [hovered, setHovered] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const Icon = isDark ? Moon : Sun;

  return (
    <button
      onClick={toggleTheme}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        relative flex items-center justify-center w-9 h-9 rounded-xl
        transition-all duration-300
        border border-white/10
        bg-white/5
        hover:bg-white/10 hover:border-white/20
        text-white
        ${className}
      `}
    >
      <Icon
        size={18}
        className={`transition-all duration-300 ${
          hovered ? "animate-ping" : ""
        }`}
      />
      <span className="absolute -top-2 -right-2 w-2 h-2 rounded-full bg-emerald-400 opacity-0 transition-opacity duration-300 hover:opacity-100"></span>
    </button>
  );
}
