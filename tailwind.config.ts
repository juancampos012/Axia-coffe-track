import type { Config } from "tailwindcss";

export default {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#215a6d",
        homePrimary: {
          DEFAULT: '#1E3C8b',
          100: '#FFFFFF',
          200: '#ADADAE',
          300: '#1A172B',
          400: '#13275a',
        },
        secondary: {
          DEFAULT: '#2d2d29',
          100: '#ff901',
          200: '#18D99B'
        },
        tertiary:{
          DEFAULT: '#1e3c8b',
          100: '#92c7a3',
          200: '#0009DB'
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
