/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.js", 
    "./components/**/*.js",
    "./screens/**/*.js"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        paper: "#F8FAFC",
        card: "#FFFFFF",
        outline: "#E5E7EB",
        muted: "#6B7280",
        accent: {
          blue: "#2563EB",
          red: "#E11D48",
          gold: "#b69c5cff",
        },
    },
    boxShadow: {
        card: "0 2px 10px rgba(17, 24, 39, 0.06)",
      },
    borderRadius: {
        card: "12px",
      },
    },    
  },
  plugins: [],
}