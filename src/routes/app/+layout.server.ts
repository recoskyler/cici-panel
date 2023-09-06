
import { db } from '$lib/server/drizzle';
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { ENABLE_EMAIL_VERIFICATION } from '$lib/constants';
import { eq } from 'drizzle-orm';
import { user } from '$lib/db/schema';

export const load: LayoutServerLoad = async ({ locals }) => {
  const session = await locals.auth.validate();

  if (!session || (ENABLE_EMAIL_VERIFICATION && !session.user.verified)) {
    throw redirect(302, '/login');
  }

  const dbUser = await db.query.user.findFirst({
    with: { config: { with: true } },
    where: eq(user.id, session.user.userId),
  });

  if (!dbUser) throw error(404, 'User not found');

  if (!dbUser.config) throw redirect(302, '/app/setup');

  return { user: dbUser };
};
