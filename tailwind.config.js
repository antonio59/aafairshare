/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        blue: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      minHeight: {
        'screen': '100vh',
      },
      backgroundColor: theme => ({
        ...theme('colors'),
        'default': '#F9FAFB',
      }),
    },
  },
  plugins: [],
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  mode: 'jit',
  darkMode: 'class',
  variants: {
    extend: {
      backgroundColor: ['active', 'hover', 'focus'],
      textColor: ['active', 'hover', 'focus'],
      borderColor: ['active', 'hover', 'focus'],
      ringColor: ['active', 'hover', 'focus'],
    },
  },
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
  ],
};
