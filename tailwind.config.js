/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#fff8ef",
        ink: "#1f2937",
        sun: {
          200: "#ffd08a",
          300: "#ffbe5c",
        },
        mint: {
          100: "#ddf6eb",
          300: "#96e6c2",
        },
      },
      fontFamily: {
        display: ["Poppins", "Segoe UI", "sans-serif"],
        body: ["Nunito Sans", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
