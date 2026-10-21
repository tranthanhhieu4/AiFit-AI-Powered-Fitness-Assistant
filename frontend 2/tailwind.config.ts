import type { Config } from "tailwindcss";

// Design tokens taken from C1SE_87_AIFit_Interface_Design_Document_v1_0.docx
// (section 3.1 "Feedback conventions") - gold on cream/beige, warm neutrals.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FAF4E7",
        surface: "#FFFFFF",
        border: "#DFD1B5",
        ink: "#3A2E20",
        muted: "#928067",
        gold: {
          DEFAULT: "#BF8E2D",
          dark: "#896318",
          light: "#F6E7C5",
        },
        success: { DEFAULT: "#438459", light: "#E0EEE0" },
        danger: { DEFAULT: "#B54C3D", light: "#F7E3DB" },
        warning: { DEFAULT: "#BF7A22", light: "#FAEBD2" },
        sidebar: "#2E251A",
      },
      borderRadius: {
        card: "12px",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
