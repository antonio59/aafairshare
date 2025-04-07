// No longer import the config directly

export default {
  plugins: {
    // Pass the path to the config file instead of the imported object
    '@tailwindcss/postcss': { config: './tailwind.config.ts' },
    autoprefixer: {},
  },
}
