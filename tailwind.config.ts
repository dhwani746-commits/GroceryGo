import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors - Primary Blue
        'brand-primary': {
          900: '#0D2F5C',
          700: '#1A5EA8',
          600: '#2172C7',
          500: '#3A8FE8',
          200: '#B3D4F7',
          50: '#EBF4FF',
        },
        // Brand Colors - Accent Saffron
        'brand-accent': {
          700: '#B85A00',
          500: '#F07B00',
          200: '#FFD5A0',
          50: '#FFF4E6',
        },
        // Neutral Gray Scale
        'neutral': {
          950: '#0F0F0F',
          900: '#1A1A1A',
          700: '#3D3D3D',
          500: '#717171',
          400: '#9E9E9E',
          300: '#C8C8C8',
          200: '#E3E3E3',
          100: '#F2F2F2',
          50: '#F8F8F8',
          0: '#FFFFFF',
        },
        // Status Colors - Success Green
        'status-success': {
          700: '#1A6B3C',
          500: '#28A460',
          100: '#D4F0E0',
          50: '#EDFAF3',
        },
        // Status Colors - Warning Amber
        'status-warning': {
          700: '#7A4800',
          500: '#D08000',
          100: '#FDEAB0',
          50: '#FEF7DC',
        },
        // Status Colors - Danger Red
        'status-danger': {
          700: '#8B1A1A',
          500: '#D83030',
          100: '#FBDADA',
          50: '#FEF2F2',
        },
        // Status Colors - Info Blue (alias to primary)
        'status-info': {
          700: '#1A5EA8',
          500: '#2172C7',
          50: '#EBF4FF',
        },
      },
      fontSize: {
        xs: ['11px', { lineHeight: '1.4' }],
        sm: ['13px', { lineHeight: '1.5' }],
        base: ['15px', { lineHeight: '1.6' }],
        md: ['17px', { lineHeight: '1.5', fontWeight: '500' }],
        lg: ['20px', { lineHeight: '1.4', fontWeight: '500' }],
        xl: ['24px', { lineHeight: '1.3', fontWeight: '500' }],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '20px',
        'full': '9999px',
      },
    },
  },
  plugins: [],
};

export default config;
