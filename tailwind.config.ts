import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0b1017",
        jade: "#0f1a24",
        gold: "#f4c165",
        mint: "#7de3c8"
      }
    }
  },
  plugins: []
};

export default config;
