import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Expedition 33',
      description: 'A spoiler-conscious leveling companion for Clair Obscur: Expedition 33.',
      tagline: 'A spoiler-conscious leveling companion',
      favicon: '/favicon.png',
      sidebar: [],
      tableOfContents: false,
      pagination: false,
      lastUpdated: false,
      pagefind: false,
      credits: false,
      customCss: ['./src/styles/starlight-app.css'],
    }),
    vue(),
    tailwind(),
  ],
  devToolbar: { enabled: false },
});
