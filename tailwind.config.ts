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
        // Custom Pastel Blue Palette for Hajat Kita
        pastel: {
          50: "#F0F9FF",  // ultra soft ice blue / background tint
          100: "#E0F2FE", // soft sky mist
          200: "#BAE6FD", // light powder blue / border accent
          300: "#7DD3FC", // pastel baby blue
          400: "#38BDF8", // primary pastel accent
          500: "#0EA5E9", // vibrant brand sky
          600: "#0284C7", // active text contrast
          700: "#0369A1", // deep ocean slate
          800: "#075985",
          900: "#0C4A6E",
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
          DEFAULT: "#0284C7", // Pastel Sky 600
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#E0F2FE", // Pastel Sky 100
          foreground: "#0369A1",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#BAE6FD", // Pastel Sky 200
          foreground: "#0284C7",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "#38BDF8",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        serif: ["Playfair Display", "Merriweather", "serif"],
      },
      boxShadow: {
        "pastel-sm": "0 2px 8px -2px rgba(56, 189, 248, 0.12), 0 1px 4px -1px rgba(0, 0, 0, 0.04)",
        "pastel-md": "0 8px 24px -4px rgba(56, 189, 248, 0.16), 0 2px 8px -2px rgba(0, 0, 0, 0.04)",
        "pastel-glow": "0 0 20px rgba(56, 189, 248, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
