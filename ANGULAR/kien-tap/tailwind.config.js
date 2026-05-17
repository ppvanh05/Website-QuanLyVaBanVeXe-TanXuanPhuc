/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#009ba1",
        secondary: "#526070",
        "urgent-orange": "#f37021",
        background: "#F8F9FA",
        surface: "#FFFFFF",
        "surface-container": "#F0F4F8",
        "surface-container-low": "#F7F9FC",
        "surface-container-lowest": "#FFFFFF",
        "on-primary": "#FFFFFF",
        "on-surface": "#1B1B1F",
        "on-surface-variant": "#44474E",
        "outline-variant": "#C4C6D0",
      },
      spacing: {
        "margin-desktop": "80px",
        gutter: "24px",
      },
      maxWidth: {
        "container-max": "1280px",
      },
      fontSize: {
        "display-lg": ["57px", { lineHeight: "64px", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "headline-md": ["28px", { lineHeight: "36px", fontWeight: "500" }],
        "title-lg": ["22px", { lineHeight: "28px", fontWeight: "500" }],
        "label-md": ["12px", { lineHeight: "16px", fontWeight: "500" }],
        "label-sm": ["11px", { lineHeight: "16px", fontWeight: "500" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
      },
      fontFamily: {
        body: ["Inter", "sans-serif"],
      }
    },
  },
  plugins: [],
}
