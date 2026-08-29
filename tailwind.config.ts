import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── ENCUADRE color tokens ───────────────────────────────────────────
      colors: {
        ink: {
          950: '#080714',
          900: '#100A2E',
        },
        brand: {
          purple: {
            700: '#5B21E8',
            500: '#7C3DFF',
          },
          green: {
            600: '#16C95A',
            400: '#45E679',
          },
        },
        surface: {
          50: '#F7F7FB',
          100: '#EEEEF5',
        },
        muted: {
          dark: '#A9A7B7',
          light: '#626171',
        },
        semantic: {
          success: '#16C95A',
          warning: '#F5A524',
          danger: '#E5484D',
          info: '#7C3DFF',
        },
      },

      // ─── Brand fonts ──────────────────────────────────────────────────────
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        geist: ['Geist', 'sans-serif'],
        sans: ['Geist', 'sans-serif'],
      },

      // ─── Type scale ───────────────────────────────────────────────────────
      fontSize: {
        'display': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],          // 64px
        'display-mobile': ['2.5rem', { lineHeight: '1.2' }],                            // 40px
        'h1': ['2.5rem', { lineHeight: '1.2' }],                                        // 40px
        'h1-mobile': ['2rem', { lineHeight: '1.2' }],                                   // 32px
        'h2': ['1.875rem', { lineHeight: '1.3' }],                                      // 30px
        'h3': ['1.375rem', { lineHeight: '1.4' }],                                      // 22px
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],                                 // 18px
        'body': ['1rem', { lineHeight: '1.5' }],                                        // 16px
        'small': ['0.875rem', { lineHeight: '1.4' }],                                   // 14px
        'caption': ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.05em' }],         // 12px
      },

      // ─── Spacing (4px base) ───────────────────────────────────────────────
      spacing: {
        'sidebar': '272px',
        'client-max': '520px',
        'gutter': '24px',
        'gutter-lg': '32px',
      },

      // ─── Border radius ────────────────────────────────────────────────────
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
        'card': '16px',
        'pill': '999px',
      },

      // ─── Box shadows (soft, tinted) ───────────────────────────────────────
      boxShadow: {
        'card': '0 4px 24px 0 rgba(8, 7, 20, 0.5)',
        'card-hover': '0 8px 40px 0 rgba(124, 61, 255, 0.15)',
        'glow-purple': '0 0 32px 0 rgba(124, 61, 255, 0.25)',
        'glow-green': '0 0 32px 0 rgba(22, 201, 90, 0.20)',
      },

      // ─── Background images (gradients) ────────────────────────────────────
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7C3DFF 0%, #45E679 100%)',
        'brand-gradient-subtle': 'linear-gradient(135deg, rgba(124,61,255,0.15) 0%, rgba(69,230,121,0.08) 100%)',
        'dark-gradient': 'linear-gradient(180deg, #080714 0%, #100A2E 100%)',
      },

      // ─── Transitions ──────────────────────────────────────────────────────
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '250ms',
      },

      // ─── Z-index ──────────────────────────────────────────────────────────
      zIndex: {
        'sidebar': '40',
        'topbar': '50',
        'modal': '100',
        'toast': '200',
      },

      // ─── Max widths ───────────────────────────────────────────────────────
      maxWidth: {
        'studio': '1440px',
        'client': '520px',
      },

      // ─── Min height for touch targets ─────────────────────────────────────
      minHeight: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
}

export default config
