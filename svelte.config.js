import adapter from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [vitePreprocess({})],

  kit: {
    adapter: adapter(),
    alias: {
      stores: 'src/lib/stores',
      components: 'src/lib/components',
      images: 'src/lib/images',
      styles: 'src/lib/styles',
    },
    version: { name: process.env.npm_package_version },
  },
};

export default config;
