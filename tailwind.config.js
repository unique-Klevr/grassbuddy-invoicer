export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pine: { 50: "#eef8f1", 100: "#d8eee0", 300: "#7fbe91", 500: "#237447", 600: "#185f39", 700: "#12492e", 800: "#0d351f", 900: "#082516" },
        ink: "#060E04",
        forest: "#060E04",
        leaf: "#3F9D25",
        olive: "#4B663A",
        mint: "#F3F7ED",
        paper: "#ffffff",
        mist: "#F3F7ED",
        line: "#dfe6e1"
      },
      boxShadow: { soft: "0 16px 40px rgba(8, 37, 22, 0.09)", lift: "0 24px 70px rgba(8, 37, 22, 0.16)", organic: "0 18px 0 rgba(6, 14, 4, 0.04)" }
    }
  },
  plugins: []
};
