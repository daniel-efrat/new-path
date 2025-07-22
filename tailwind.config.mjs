import { defineConfig } from "tailwindcss"
import animate from "tailwindcss-animate"

export default defineConfig({
  darkMode: "class", // because the dark tokens live under `.dark`

  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  safelist: [
    "animate-in",
    "animate-out",
    "fade-in",
    "fade-out",
    "slide-in",
    "slide-out",
    "slide-in-up",
    "slide-out-down",
    "zoom-in",
    "zoom-out",
    "scale-in",
    "scale-out",
  ],

  theme: {
    extend: {},
  },

  plugins: [animate],
})
