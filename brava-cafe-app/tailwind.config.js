/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta general de marca (etiqueta Colombia)
        brava: {
          red: '#DE2720',
          reddark: '#A31F1A',
          blush: '#FDCAB8',
          cream: '#FFF6F1',
        },
        // Acento específico del origen Honduras (etiqueta Honduras)
        honduras: {
          green: '#416B51',
          greendark: '#2F4D3A',
          sage: '#D5DAC9',
        },
      },
      fontFamily: {
        display: ['"Archivo Black"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
