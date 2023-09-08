import { lucia } from 'lucia';
import { dev } from '$app/environment';
import { pg } from '@lucia-auth/adapter-postgresql';
import { db, pool } from '$lib/server/drizzle';
import { sveltekit } from 'lucia/middleware';
import { EMAIL_VERIFICATION_EXPIRATION, PASSWORD_RESET_EXPIRATION } from '$env/static/private';
import { token } from '$lib/db/schema';
import type { NewToken } from '$lib/db/types';
import { eq } from 'drizzle-orm';
import { generateRandomString, isWithinExpiration } from 'lucia/utils';

export const auth = lucia({
  env: dev ? 'DEV' : 'PROD',
  middleware: sveltekit(),
  sessionCookie: { expires: false },
  adapter: pg(
    pool,
    {
      user: 'auth_user',
      key: 'user_key',
      session: 'user_session',
    },
  ),
  getUserAttributes: data => {
    return {
      email: data.email,
      verified: data.verified,
    };
  },
});

export type Auth = typeof auth;

export const generateVerificationToken = async (userId: string, expirationInMinutes: number) => {
  const storedUserTokens = await db.query.token.findMany({ where: eq(token.userId, userId) });

  if (storedUserTokens.length > 0) {
    const reusableStoredToken = storedUserTokens.find(token => {
      return isWithinExpiration(
        token.expires - (1000 * 60 * expirationInMinutes) / 2,
      );
    });

    if (reusableStoredToken) return reusableStoredToken.id;
  }

  const verificationToken: NewToken = {
    id: generateRandomString(128),
    expires: (new Date).getTime() + (1000 * 60 * expirationInMinutes),
    userId: userId,
  };

  await db.insert(token).values(verificationToken);

  return verificationToken.id;
};

export const validateToken = async (verificationToken: string) => {
  const storedToken = await db.query.token.findFirst({ where: eq(token.id, verificationToken) });

  if (!storedToken) throw new Error('invalid-or-expired-token');

  await db.delete(token).where(eq(token.id, verificationToken));

  if (!isWithinExpiration(storedToken.expires)) {
    throw new Error('invalid-or-expired-token');
  }

  return storedToken.userId;
};

export const generateEmailVerificationToken = async (userId: string) => {
  const expiration = EMAIL_VERIFICATION_EXPIRATION === ''
    ? 10
    : Number(EMAIL_VERIFICATION_EXPIRATION);

  return await generateVerificationToken(userId, expiration);
};

export const generatePasswordResetToken = async (userId: string) => {
  const expiration = PASSWORD_RESET_EXPIRATION === ''
    ? 10
    : Number(PASSWORD_RESET_EXPIRATION);

  return await generateVerificationToken(userId, expiration);
};
