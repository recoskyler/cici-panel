import { auth, validateToken } from '$lib/server/lucia';
import { fail, type Actions } from '@sveltejs/kit';
import { passwordResetLimiter } from '$lib/server/limiter';
import type { PageServerLoad } from './$types';
import {
  ENABLE_RATE_LIMIT, MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH,
} from '$lib/constants';
import { z } from 'zod';
import {
  message, setError, superValidate,
} from 'sveltekit-superforms/server';
import { isPasswordValid } from '$lib/functions/validators';

const passwordResetSchema = z.object(
  { password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH) },
);

export const load: PageServerLoad = async event => {
  passwordResetLimiter.cookieLimiter?.preflight(event);

  const form = await superValidate(passwordResetSchema);

  return { form };
};

export const actions: Actions = {
  default: async event => {
    const { request, params } = event;

    const form = await superValidate(request, passwordResetSchema);

    if (ENABLE_RATE_LIMIT && await passwordResetLimiter.isLimited(event)) {
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

    try {
      const userId = await validateToken(params.token ?? '');
      const user = await auth.getUser(userId);

      if (!isPasswordValid(form.data.password)) {
        console.error('Invalid password');

        return setError(
          form,
          'password',
          'auth.password-does-not-meet-requirements',
        );
      }

      await auth.invalidateAllUserSessions(user.userId);
      await auth.updateKeyPassword('email', user.email, form.data.password);

      console.log('Changed password successfully');
    } catch (e) {
      console.error(e);

      return setError(form, '', 'auth.invalid_token');
    }

    return message(form, 'auth.reset-password_successful');
  },
};
