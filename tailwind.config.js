module.exports = {
  mode: "jit",
  content: ["./src/**/*.tsx", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      screens: {
        cal: "1420px",
        settin: "1555px",
      },
      colors: {
        "my-bright-blue": "#86d3ff",
        "calendar-blue": "#3788d8",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
