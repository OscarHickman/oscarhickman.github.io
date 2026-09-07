import {
  createLocalFontProcessor,
} from '@unocss/preset-web-fonts/local'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  theme: {
    colors: {
      bg: 'var(--bg)',
      raised: 'var(--bg-raised)',
      sunken: 'var(--bg-sunken)',
      fg: 'var(--fg)',
      muted: 'var(--fg-muted)',
      subtle: 'var(--fg-subtle)',
      border: 'var(--border)',
      borderStrong: 'var(--border-strong)',
      accent: 'var(--accent)',
      accentHover: 'var(--accent-hover)',
      accentMuted: 'var(--accent-muted)',
      spec: {
        o: 'var(--spec-o)',
        b: 'var(--spec-b)',
        a: 'var(--spec-a)',
        f: 'var(--spec-f)',
        g: 'var(--spec-g)',
        k: 'var(--spec-k)',
        m: 'var(--spec-m)',
      },
    },
    borderRadius: {
      sm: 'var(--r-sm)',
      md: 'var(--r-md)',
      lg: 'var(--r-lg)',
    },
    animation: {
      durations: {
        fast: 'var(--dur-fast)',
        slow: 'var(--dur-slow)',
      },
      timingFns: {
        DEFAULT: 'var(--ease)',
      },
    },
  },
  shortcuts: [
    {
      'bg-base': 'bg-[var(--bg)]',
      'color-base': 'text-[var(--fg)]',
      'border-base': 'border-[var(--border)]',
    },
    [/^btn-(\w+)$/, ([_, color]) => `op50 px2.5 py1 transition-all duration-200 ease-out no-underline! hover:(op100 text-${color} bg-${color}/10) border border-base! rounded`],
  ],
  rules: [
    [/^slide-enter-(\d+)$/, ([_, n]) => ({
      '--enter-stage': n,
    })],
  ],
  presets: [
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'height': '1.2em',
        'width': '1.2em',
        'vertical-align': 'text-bottom',
      },
    }),
    presetAttributify(),
    presetWind3(),
    presetWebFonts({
      fonts: {
        sans: 'Inter',
        mono: 'DM Mono',
        condensed: 'Roboto Condensed',
        wisper: 'Bad Script',
        display: 'Space Grotesk:400,500,600,700',
        serif: 'STIX Two Text:400,500,600,700',
      },
      processors: createLocalFontProcessor(),
    }),
  ],
  transformers: [
    transformerDirectives(),
  ],
  safelist: [
    'i-ri-menu-2-fill',
  ],
})
