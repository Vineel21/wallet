import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ["var(--font-syne)", "sans-serif"],
        space: ["var(--font-space)", "sans-serif"],
        outfit: ["var(--font-outfit)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      colors: {
        ink: "#03050c",
        panel: "#090d16",
        panel2: "#0f1624",
        line: "#1b2436",
        mint: "#10b981",
        cyan: "#06b6d4",
        amber: "#f59e0b",
        rose: "#f43f5e",
        purple: "#a855f7",
        pink: "#ec4899"
      },
      borderRadius: {
        ui: "12px"
      },
      boxShadow: {
        glow: "0 0 40px rgba(168, 85, 247, 0.15)",
        cyanGlow: "0 0 40px rgba(6, 182, 212, 0.15)",
        mintGlow: "0 0 40px rgba(16, 185, 129, 0.15)"
      }
    }
  },
  plugins: []
};

export default config;
