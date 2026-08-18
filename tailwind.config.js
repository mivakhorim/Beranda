/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
dark: '#1e2d24',
          gold: '#c5a880',        // Digunakan untuk dekorasi/aksen
          'gold-text': '#7d6642', // <--- TAMBAHKAN INI (Emas Gelap untuk Teks)
          light: '#f7f6f2',
          accent: '#2d4b37',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
