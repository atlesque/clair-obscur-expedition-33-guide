import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwindcss from '@tailwindcss/vite';
import ui from '@nuxt/ui/vite';
// Harborlight design system: Nuxt UI 4 on plain Vue (no Nuxt) with Tailwind CSS 4. Colors live in src/styles/main.css.
export default defineConfig({
  integrations: [vue({ appEntrypoint: '/src/pages/_app' })],
  devToolbar: { enabled: false },
  vite: {
    plugins: [
      tailwindcss(),
      ui({
        router: false,
        colorMode: false,
        // Lucide icons are bundled at build time, so no requests go to the Iconify API.
        icon: { clientBundle: { scan: true, sizeLimitKb: 0 } },
        ui: {
          colors: { primary: 'primary', secondary: 'secondary', success: 'success', info: 'info', warning: 'warning', error: 'error', neutral: 'neutral' },
          button: { defaultVariants: { size: 'md' } },
          input: { defaultVariants: { size: 'md' } },
          inputMenu: { defaultVariants: { size: 'md' } },
          card: { defaultVariants: { variant: 'outline' } },
        },
      }),
    ],
  },
});
