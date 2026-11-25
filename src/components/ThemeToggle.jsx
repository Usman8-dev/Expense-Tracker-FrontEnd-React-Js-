import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/**
 * ThemeToggle - a small icon button that switches between light and dark mode.
 * Shows a Moon icon in dark mode (inviting the user to switch to light) and
 * a Sun icon in light mode. Increased size and contrast for visibility.
 */
function ThemeToggle({ className = "" }) {
  const [hovered, setHovered] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const Icon = isDark ? Moon : Sun;

  return (
    <button
      onClick={(event) => {
        // Prevent a parent clickable container (e.g. the sidebar logo) from
        // treating a theme change as a navigation click.
        event.stopPropagation();
        toggleTheme();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        relative flex items-center justify-center
        w-10 h-10 rounded-full
        transition-all duration-300
        border border-white/20
        bg-white/10
        text-white
        shadow-sm
        hover:bg-white/15 hover:border-white/30
        focus:outline-none focus:ring-2 focus:ring-white/20
        ${className}
      `}
    >
      <Icon
        size={14}
        className={`transition-all duration-300 ${
          hovered ? "animate-pulse" : ""
        }`}
      />
      <span
        className="absolute -inset-2 rounded-full bg-emerald-500/20 opacity-0 transition-opacity duration-300 hover:opacity-100"
      />
    </button>
  );
}

export { ThemeToggle };
export default ThemeToggle;
