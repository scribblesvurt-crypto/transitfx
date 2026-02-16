import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'TransitFX — Page Transition Effects',
    description: 'Cyberpunk page transition effects — matrix rain, glitch, VHS, CRT, and 20 more. 4 themes, adjustable speed.',
    version: '1.0.0',
    permissions: ['storage'],
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      128: 'icon/128.png',
    },
    commands: {
      'skip-effect': {
        suggested_key: {
          default: 'Alt+Shift+S',
        },
        description: 'Skip current transition effect',
      },
      'toggle-extension': {
        suggested_key: {
          default: 'Alt+Shift+T',
        },
        description: 'Toggle TransitFX on/off',
      },
    },
  },
  imports: {
    addons: {
      vite: [],
    },
  },
  alias: {
    '@': new URL('./', import.meta.url).pathname,
  },
});
