/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#003366',       
        'secondary': '#f6993f',     
        'success': '#38c172',      
        'danger': '#e3342f',        
        'accent': '#9561e2',        
        'background': '#197bddff'   
      },
    },
  },
  plugins: [],
}