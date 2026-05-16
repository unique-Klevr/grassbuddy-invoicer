/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pine: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        lime: {
          400: "#a3e635",
          500: "#84cc16",
          600: "#65a30d",
        },
        ink: "#0a0c10",
        paper: "#ffffff",
        mist: "#f8faf9",
        line: "#e5e7eb"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0, 0, 0, 0.04)",
        lift: "0 20px 50px rgba(5, 46, 22, 0.1)",
      },
      borderRadius: {
        '4xl': '2rem',
      }
    }
  },
  plugins: []
};
