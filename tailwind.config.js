module.exports = {
  mode: "jit",
  content: ["./src/**/*.tsx", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      screens: {
        cal: "1420px",
      },
      colors: {
        "my-bright-blue": "#86d3ff",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
