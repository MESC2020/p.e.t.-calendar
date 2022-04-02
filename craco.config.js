module.exports = {
  style: {
    postOptions: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
  typescript: {
    enableTypeChecking: true,
  },
};
