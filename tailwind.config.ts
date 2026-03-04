import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx,js,jsx}", "./components/**/*.{ts,tsx,js,jsx}", "./lib/**/*.{ts,tsx,js}"],
  theme: {
    extend: {
      colors: {
        night: "#0b1017",
        jade: "#0f1a24",
        gold: "#f4c165",
        mint: "#7de3c8",
        primary: "#157347",
        softBeige: "#FBF8F3",
        pageBg: "#F7F9FB"
      },
      fontFamily: {
        arabic: ["Cairo", "Noto Sans Arabic", "system-ui", "sans-serif"],
        serifArabic: ["Noto Serif Arabic", "serif"],
        sans: ["Source Sans 3", "system-ui", "sans-serif"]
      },
      maxWidth: {
        reading: "65ch",
        'content-lg': '1024px'
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04)'
      },
      borderRadius: {
        sm: '6px'
      },
      lineHeight: {
        'relaxed-ar': '1.8'
      }
    }
  },
  plugins: []
};

export default config;
