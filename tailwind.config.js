export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pine: { 50: "#eef8f1", 100: "#d8eee0", 300: "#7fbe91", 500: "#237447", 600: "#185f39", 700: "#12492e", 800: "#0d351f", 900: "#082516" },
        ink: "#080b0a",
        paper: "#ffffff",
        mist: "#f5f7f5",
        line: "#dfe6e1"
      },
      boxShadow: { soft: "0 16px 40px rgba(8, 37, 22, 0.09)", lift: "0 24px 70px rgba(8, 37, 22, 0.16)" }
    }
  },
  plugins: []
};
