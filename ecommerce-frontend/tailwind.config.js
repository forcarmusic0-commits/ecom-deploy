/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FBFAF6",
        ink: "#1C2321",
        forest: {
          DEFAULT: "#2F6F4E",
          dark: "#234F38",
          light: "#DCEAE2",
        },
        ochre: {
          DEFAULT: "#C98A3E",
          light: "#F3E3CB",
        },
        line: "#E4E0D6",
        muted: "#6B6A63",
      },
      fontFamily: {
        serif: ["\"Source Serif 4\"", "Georgia", "serif"],
        sans: ["\"IBM Plex Sans\"", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "4px",
      },
    },
  },
  plugins: [],
};
