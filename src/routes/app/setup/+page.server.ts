import {
  error, redirect, fail,
} from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/drizzle';
import { userConfig } from '$lib/db/schema';
import {
  DISCLAIMER_DISMISSED_COOKIE_NAME,
  ENABLE_EMAIL_VERIFICATION,
} from '$lib/constants';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { insertUserConfigSchema, type NewUserConfig } from '$lib/db/types';
import { auth } from '$lib/server/lucia';
import { fullUserQuery } from '$lib/server/queries';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth.validate();

  if (!session || (ENABLE_EMAIL_VERIFICATION && !session.user.verified)) {
    throw redirect(302, '/login');
  }

  const dbUser = await fullUserQuery.execute({ id: session.user.userId });

  if (!dbUser || dbUser.deleted) throw error(404, 'auth.user-not-found');

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
        displayname: form.data.displayname.trim(),
        firstname: form.data.firstname.trim(),
        lastname: form.data.lastname ? form.data.lastname.trim() : undefined,
        mobile: form.data.mobile ? form.data.mobile.trim() : undefined,
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

    cookies.delete(DISCLAIMER_DISMISSED_COOKIE_NAME);

    if (!session) return fail(401);

    await auth.invalidateSession(session.sessionId); // invalidate session

    locals.auth.setSession(null); // remove cookie
  },
};
