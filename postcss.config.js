export default {
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: {
      content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
      safelist: [
        'bg-gray-50',
        'bg-white',
        'text-gray-900',
        'text-gray-600',
        'text-blue-600',
        'hover:text-blue-500',
        'bg-blue-600',
        'hover:bg-blue-700',
        'focus:ring-blue-500',
        'border-blue-500',
        'border-gray-300',
        {
          pattern: /^(bg|text|border|ring)-(gray|blue)-(50|500|600|700|900)/,
          variants: ['hover', 'focus', 'active'],
        },
      ]
    },
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
  },
};
