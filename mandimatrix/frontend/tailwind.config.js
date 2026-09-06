/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        soil: "#5b3f2f",
        leaf: "#167047",
        crop: "#f3b23c",
        market: "#255f85",
      },
      boxShadow: {
        panel: "0 16px 45px rgba(33, 38, 33, 0.09)",
      },
    },
  },
  plugins: [],
};
