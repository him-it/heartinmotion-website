/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      browsers: ['last 10 versions']
    }
  },
};

export default config;
