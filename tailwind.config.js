module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      'sm': '640px',
      'sm2': '702px',
      'md': '768px',
      'mdx': '860px',
      'lgs': '930px',
      'lg': '1024px',
      'lg2': '1170px',
      'sxl': '1200px',
      'xl': '1280px',
      'xl2': '1400px',
      '2xl': '1536px',
      'xs': '450px', 
      'xs2': '600px', 
    },
    extend: {
      fontFamily: {
        iransans: 'IRANSansWeb',
        iranyekan: ['IRANYekan', 'sans-serif'],
      },
      boxShadow: {
        '3xl': '0 0 10px 3px rgba(0,0,0,0.08)',
      },
      colors: {
        gray: {},
      },
    },
    container: {
      center: true,
    },
  },
  plugins: [
    require("flowbite/plugin")
  ],
}
