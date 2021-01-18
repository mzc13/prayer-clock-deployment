module.exports = {
  purge: {
    enabled: true,
    content: ["./static/**/*.html", "./static/**/*.js"],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      gridRowStart: {
        8: "8",
        9: "9",
        10: "10",
        11: "11",
      },
    },
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      flexWrap: ["responsive"],
    },
  },
  plugins: [],
};
