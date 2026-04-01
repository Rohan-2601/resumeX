/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      width: {
        120: "30rem",
        75: "18.75rem",
      },
      height: {
        120: "30rem",
        75: "18.75rem",
      },
      zIndex: {
        100: "100",
      },
      backdropFilter: {
        md: "blur(10px)",
      },
    },
  },
  plugins: [],
};
