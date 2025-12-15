/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F4E6D4",
        rosepier: "#ddb1b1",
        rose: "#D09493",
        wine: "#810048",
        wineDark: "#50173C",
        red: "#C8083D",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["'Poppins'", "sans-serif"],

        // ✅ NUEVAS
        maison: ['"Maison Neue"', "system-ui", "sans-serif"],
        agenda: ['"Agenda"', "system-ui", "sans-serif"],      
        alkaline: ['"Alkaline"', "system-ui", "sans-serif"], // ✅ nueva

      },
      boxShadow: {
        suave: "0 3px 10px rgba(76,25,56,0.15)",
      },
      borderRadius: {
        xl: "1rem",
      },
      transitionDuration: {
        DEFAULT: "300ms",
      },
    },
  },
  plugins: [],
};
