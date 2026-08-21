/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: "#0a1a3f",
        turquoise: "#2dd9e8",
        "turquoise-dark": "#14b8a6",
        bg: "#f7fafc",
      },
      borderRadius: {
        card: "20px",
      },
    },
  },
  plugins: [],
};
