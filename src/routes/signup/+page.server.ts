import {
  error, fail, redirect,
} from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import type { PageServerLoad, Actions } from './$types';
import {
  ALLOW_REGISTERS,
  ENABLE_EMAIL_VERIFICATION, ENABLE_RATE_LIMIT, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH,
} from '$lib/constants';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { insertUserSchema } from '$lib/db/types';
import { z } from 'zod';
import { isPasswordValid } from '$lib/functions/validators';
import { signUpLimiter } from '$lib/server/limiter';

const insertAuthUserSchema = insertUserSchema.extend(
  { password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH) },
);

export const actions: Actions = {
  default: async event => {
    if (!ALLOW_REGISTERS) throw error(501, 'feature-disabled');

    const { request, locals } = event;

    const form = await superValidate(request, insertAuthUserSchema);

    if (ENABLE_RATE_LIMIT && await signUpLimiter.isLimited(event)) {
      return setError(
        form,
        '',
        'rate-limiter.too-fast-error',
      );
    }

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { form });
    }

    if (!isPasswordValid(form.data.password)) {
      return setError(form, 'password', 'Password does not meet the requirements or too weak.');
    }

    try {
      const user = await auth.createUser({
        key: {
          providerId: 'email',
          providerUserId: form.data.email.trim(),
          password: form.data.password,
        },
        attributes: {
          email: form.data.email.trim(),
          verified: false,
        },
      });

      console.log('User created');

      const session = await auth.createSession({ userId: user.userId, attributes: {} });

      console.log('Session created');

      locals.auth.setSession(session);

      console.log('Set session');
    } catch (e) {
      console.error('Email taken: ', e);

      return setError(form, 'email', 'Email already exists.');
    }

    if (ENABLE_EMAIL_VERIFICATION) {
      throw redirect(302, '/email-verification');
    }

    throw redirect(302, '/login');
  },
};

export const load: PageServerLoad = async event => {
  signUpLimiter.cookieLimiter?.preflight(event);

  const { locals } = event;
  const session = await locals.auth.validate();

  if (session) throw redirect(302, '/app');

  if (!ALLOW_REGISTERS) throw redirect(302, '/login');

  const form = await superValidate(insertAuthUserSchema);

  return { form };
};
