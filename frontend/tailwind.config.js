export default {
  content: [ "./index.html", "./src/**/*.{js,ts,jsx,tsx}", ],
  theme: {
    extend: {
      colors: {
        'primary': '#38bdf8',
        'success': '#34d399',
        'danger': '#fb7185',
        'background': '#07111f'
      },
      boxShadow: {
        glow: '0 20px 60px rgba(56, 189, 248, 0.25)',
      },
    },
  },
  plugins: [],
}
