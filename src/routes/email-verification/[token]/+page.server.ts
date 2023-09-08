import { auth, validateToken } from '$lib/server/lucia';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ENABLE_EMAIL_VERIFICATION, ENABLE_RATE_LIMIT } from '$lib/constants';
import { emailVerificationLimiter } from '$lib/server/limiter';

export const load: PageServerLoad = async event => {
  if (!ENABLE_EMAIL_VERIFICATION) {
    throw error(501, 'feature-disabled');
  }

  emailVerificationLimiter.cookieLimiter?.preflight(event);

  if (ENABLE_RATE_LIMIT && await emailVerificationLimiter.isLimited(event)) {
    throw error(429, 'rate-limiter.too-fast-error');
  }

  const { locals, params } = event;
  const { token } = params;

  try {
    const userId = await validateToken(token);

    await auth.invalidateAllUserSessions(userId);
    await auth.updateUserAttributes(userId, { verified: true });

    const session = await auth.createSession({ userId, attributes: {} });

    locals.auth.setSession(session);
  } catch (e) {
    console.error(e);

    throw error(401, 'invalid-or-expired-token');
  }
};
