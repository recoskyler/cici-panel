import { lucia } from 'lucia';
import { dev } from '$app/environment';
import { pg } from '@lucia-auth/adapter-postgresql';
import { pool } from '$lib/server/drizzle';
import { sveltekit } from 'lucia/middleware';

export const auth = lucia({
  env: dev ? 'DEV' : 'PROD',
  middleware: sveltekit(),
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
      displayName: data.displayName,
      firstName: data.firstName,
      lastName: data.lastName,
      mobile: data.mobile,
      email: data.email,
      verified: data.verified,
    };
  },
});

export type Auth = typeof auth;
