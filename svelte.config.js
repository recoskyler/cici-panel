import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [vitePreprocess({})],

  kit: {
    adapter: adapter(),
    alias: {
      writables: 'src/lib/writables',
      components: 'src/lib/components',
      images: 'src/lib/images',
      styles: 'src/lib/styles',
    },
    version: { name: process.env.npm_package_version },
  },
};

export default config;
