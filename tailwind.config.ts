import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        "3xl": "1920px",
      },
      colors: {
        navy: {
          DEFAULT: "var(--primary-navy)",
          light: "var(--primary-navy-light)",
          dark: "var(--primary-navy-dark)",
        },
        brand: {
          blue: "var(--primary-blue)",
          "blue-dark": "var(--primary-blue-dark)",
          "blue-light": "var(--primary-blue-light)",
        },
        accent: {
          green: "var(--accent-green)",
          "green-light": "var(--accent-green-light)",
          rose: "var(--accent-rose)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-nunito)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        card: "0 2px 4px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "card-hover": "0 4px 8px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        glass: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      },
      backgroundImage: {
        "accent-rose-gradient": "var(--accent-rose-gradient)",
        "accent-rose-gradient-deep": "var(--accent-rose-gradient-deep)",
        "primary-blue-gradient": "var(--primary-blue-gradient)",
        "primary-blue-gradient-soft": "var(--primary-blue-gradient-soft)",
      },
    },
  },
  plugins: [forms],
} satisfies Config;

export default config;
