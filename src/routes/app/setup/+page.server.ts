import {
  error, redirect, fail,
} from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/drizzle';
import { user, userConfig } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  DISCLAIMER_DISMISSED_COOKIE_NAME, DO_NOT_TRACK_COOKIE_NAME, ENABLE_EMAIL_VERIFICATION,
} from '$lib/constants';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { insertUserConfigSchema, type NewUserConfig } from '$lib/db/types';
import { auth } from '$lib/server/lucia';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth.validate();

  if (!session || (ENABLE_EMAIL_VERIFICATION && !session.user.verified)) {
    throw redirect(302, '/login');
  }

  const dbUser = await db.query.user.findFirst({
    with: { config: true },
    where: eq(user.id, session.user.userId),
  });

  if (!dbUser) throw error(404, 'auth.user-not-found');
  if (dbUser.config) throw redirect(302, '/app');

  const form = await superValidate(insertUserConfigSchema.omit({ userId: true }));

  return { user: dbUser, form };
};

export const actions: Actions = {
  submit: async ({ request, locals }) => {
    const session = await locals.auth.validate();

    if (!session || (ENABLE_EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, '/login');
    }

    console.info('Creating first account...');

    const form = await superValidate(request, insertUserConfigSchema.omit({ userId: true }));

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { form });
    }

    try {
      const config: NewUserConfig = {
        userId: session.user.userId,
        displayname: form.data.displayname,
        firstname: form.data.firstname,
        lastname: form.data.lastname,
        mobile: form.data.mobile,
      };

      await db.insert(userConfig).values(config);
    } catch (e) {
      console.error('Failed to create account');
      console.error(e);
      return setError(form, '', 'failed-to-create-account');
    }

    throw redirect(302, '/app');
  },
  signOut: async ({ locals, cookies }) => {
    const session = await locals.auth.validate();

    cookies.delete(DO_NOT_TRACK_COOKIE_NAME);
    cookies.delete(DISCLAIMER_DISMISSED_COOKIE_NAME);

    if (!session) return fail(401);

    await auth.invalidateSession(session.sessionId); // invalidate session

    locals.auth.setSession(null); // remove cookie
  },
};
