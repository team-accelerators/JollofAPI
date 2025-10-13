module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#16A34A',     // Fresh Green (health)
        secondary: '#F97316',   // Warm Orange (appetite)
        accent: '#EA580C',      // Deeper orange for accents
        neutral: {
          50: '#FAFAFA',        // Clean white
          100: '#F5F5F5',       // Light gray
          200: '#E5E5E5',       // Border gray
          300: '#D4D4D4',       // Medium gray
          400: '#A3A3A3',       // Dark gray
          500: '#737373',       // Text gray
          600: '#525252',       // Dark text
          700: '#404040',       // Very dark text
          800: '#262626',       // Near black
          900: '#171717'        // Black
        }
      },
      fontFamily: {
        'sans': ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'display': ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px'
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
        'large': '0 8px 24px 0 rgba(0, 0, 0, 0.12)',
        'neumorphic': '8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.8)',
        'neumorphic-inset': 'inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.8)'
      }
    }
  },
  plugins: []
}
