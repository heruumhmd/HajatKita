import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Refined Wedding Palette: Classic Sapphire, Warm Champagne Gold, & Romantic Rose
        pastel: {
          50: "#F4F8FD",   // soft whisper blue
          100: "#E7F0FA",  // pale cloud
          200: "#C9DEF5",  // powder accent
          300: "#9EBEEC",  // subtle slate sky
          400: "#5D92DC",  // vibrant blue
          500: "#2B68C0",  // primary brand royal sapphire
          600: "#1D50A2",  // deep active blue
          700: "#173E80",  // classic navy slate
          800: "#133166",
          900: "#0F244C",
        },
        gold: {
          50: "#FDFBF7",
          100: "#FBF5E8",
          200: "#F5E7C8",
          300: "#ECCD92",
          400: "#DDB15D",
          500: "#C59B3C",
          600: "#A87E2B",
          700: "#866020",
        },
        rose: {
          50: "#FFF5F6",
          100: "#FFE6E9",
          200: "#FFC2C9",
          400: "#FB7185",
          500: "#F43F5E",
          600: "#E11D48",
          700: "#BE123C",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "#1D50A2",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F4F8FD",
          foreground: "#173E80",
        },
        muted: {
          DEFAULT: "#F3F4F6",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#FBF5E8",
          foreground: "#A87E2B",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "#2B68C0",
      },
      borderRadius: {
        "3xl": "1.25rem",
        "2xl": "1rem",
        xl: "0.75rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        serif: ["'Playfair Display'", "Georgia", "serif"],
        display: ["'Cinzel'", "'Playfair Display'", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        "subtle-sm": "0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)",
        "subtle-md": "0 4px 12px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -2px rgba(15, 23, 42, 0.03)",
        "subtle-lg": "0 12px 28px -6px rgba(15, 23, 42, 0.08), 0 4px 12px -3px rgba(15, 23, 42, 0.04)",
        "pastel-sm": "0 1px 4px 0 rgba(29, 80, 162, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        "pastel-md": "0 8px 24px -4px rgba(29, 80, 162, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.03)",
        "pastel-glow": "0 4px 20px -2px rgba(29, 80, 162, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
