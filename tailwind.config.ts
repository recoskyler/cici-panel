
import { join } from 'path';
import type { Config } from 'tailwindcss';
import { skeleton } from '@skeletonlabs/tw-plugin';
import forms from '@tailwindcss/forms';

const config = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,svelte,ts}',
    join(
      require.resolve('@skeletonlabs/skeleton'),
      '../**/*.{html,js,svelte,ts}',
    ),
  ],
  theme: { extend: {} },
  plugins: [
    forms,

    // 4. Append the Skeleton plugin (after other plugins)
    skeleton({ themes: { preset: ['wintry'] } }),
  ],
} satisfies Config;

export default config;
