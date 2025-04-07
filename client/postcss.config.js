import tailwindConfig from './tailwind.config.ts'; // Import the config

export default {
  plugins: {
    // Explicitly pass the imported config object to the Tailwind PostCSS plugin
    '@tailwindcss/postcss': { config: tailwindConfig },
    autoprefixer: {},
  },
}
