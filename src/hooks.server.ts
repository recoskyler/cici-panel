import { auth } from '$lib/server/lucia';
import type { Handle } from '@sveltejs/kit';
import { locale } from 'svelte-i18n';

export const handle: Handle = async ({ event, resolve }) => {
  const lang = event.request.headers.get('accept-language')?.split(',')[0];

  if (lang) locale.set(lang);

  event.locals.auth = auth.handleRequest(event);

  return await resolve(event);
};
