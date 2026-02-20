module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['Spoqa Han Sans Neo,sans-serif'],
      serif: ['Spoqa Han Sans Neo,sans-serif'],
    },
    extend: {
      textColor: {
        main: 'rgb(var(--color-text-main) / <alpha-value>)',
      },
      backgroundColor: {
        main: 'rgb(var(--color-bg-main) / <alpha-value>)',
        muted: 'rgb(var(--color-bg-muted) / <alpha-value>)',
      },
      borderColor: {
        main: 'rgb(var(--color-border-main) / <alpha-value>)',
      },
      typography: (theme) => ({
        dante: {
          css: {
            '--tw-prose-body': theme('textColor.main / 100%'),
            '--tw-prose-h2': `font-size: 16px !important`,
            '--tw-prose-headings': theme('textColor.main / 100%'),
            '--tw-prose-lead': theme('textColor.main / 100%'),
            '--tw-prose-links': theme('textColor.main / 100%'),
            '--tw-prose-bold': theme('textColor.main / 100%'),
            '--tw-prose-counters': theme('textColor.main / 100%'),
            '--tw-prose-bullets': 'rgb(168 162 158)', /* stone-400 */
            '--tw-prose-hr': theme('borderColor.main / 100%'),
            '--tw-prose-quotes': theme('textColor.main / 100%'),
            '--tw-prose-quote-borders': theme('borderColor.main / 100%'),
            '--tw-prose-captions': theme('textColor.main / 100%'),
            '--tw-prose-code': theme('textColor.main / 100%'),
            '--tw-prose-pre-code': theme('colors.zinc.100'),
            '--tw-prose-pre-bg': theme('colors.zinc.800'),
            '--tw-prose-th-borders': theme('borderColor.main / 100%'),
            '--tw-prose-td-borders': theme('borderColor.main / 100%'),
          },
        },
        DEFAULT: {
          css: {
            a: {
              fontWeight: 'normal',
              textDecoration: 'underline',
              textDecorationStyle: 'solid',
              textDecorationThickness: '2px',
              textDecorationColor: 'rgb(168 162 158)', /* stone-400 */
              textUnderlineOffset: '4px',
            },
            'h1,h2,h3': {
              fontFamily: theme('fontFamily.serif'),
              fontWeight: '600',
              margin: '5rem 0 1.75rem',
            },
            h1: {
              fontSize: '22px',
              lineHeight: '1.2',
            },
            h2: {
              fontSize: '20px',
              lineHeight: '1.2',
            },
            h3: {
              fontSize: '18px',
              lineHeight: '1.2',
            },
            p: {
              fontSize: '16px',
              margin: '0 0 1.75rem 0',
            },
            blockquote: {
              borderLeft: '2px solid',
              borderColor: theme('borderColor.main'),
              paddingLeft: '1rem',
              fontFamily: theme('fontFamily.serif'),
              fontSize: '1.3125rem',
              fontWeight: 'normal',
              fontStyle: 'normal',
              lineHeight: 1.75,
            },
          },
          ol: {
            listStyleType: 'decimal',
            listStylePosition: 'outside',
          },
          ul: {
            listStyleType: 'disc',
            listStylePosition: 'outside',
          },
          li: {
            margin: '7px 0 0 0',
          },
        },
        lg: {
          css: {
            blockquote: {
              paddingLeft: 0,
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
