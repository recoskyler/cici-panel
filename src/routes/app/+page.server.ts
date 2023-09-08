import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/drizzle';
import { user } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { ENABLE_EMAIL_VERIFICATION } from '$lib/constants';

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

  if (dbUser.config === null) throw redirect(302, '/app/setup');

  return { user: dbUser };
};
