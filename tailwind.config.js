/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        graphite: "#0F1117",
        panel: "#171A23",
        panel2: "#1D2130",
        violet: "#7C3AED",
        electric: "#3B82F6",
        success: "#22C55E",
        danger: "#EF4444",
      },
      borderRadius: {
        app: "20px",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0,0,0,.38)",
        glow: "0 0 34px rgba(124,58,237,.28)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
