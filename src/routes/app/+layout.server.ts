import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { ENABLE_EMAIL_VERIFICATION } from '$lib/constants';
import { fullUserQuery } from '$lib/server/queries';
import { toFullUser } from '$lib/server/granular-permissions/transform';
import { hasAnyPermissions } from '$lib/server/granular-permissions/permissions';
import { MODERATOR_PERMISSIONS } from '$lib/server/constants';

export const load: LayoutServerLoad = async ({ locals }) => {
  const session = await locals.auth.validate();

  if (!session || (ENABLE_EMAIL_VERIFICATION && !session.user.verified)) {
    throw redirect(302, '/login');
  }

  const dbUser = await fullUserQuery.execute({ id: session.user.userId });

  if (!dbUser || dbUser.deleted) throw error(404, 'auth.user-not-found');

  if (!dbUser.config) throw redirect(302, '/app/setup');

  const isModerator = hasAnyPermissions(toFullUser(dbUser), MODERATOR_PERMISSIONS);

  return { user: dbUser, isModerator };
};
