
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { ENABLE_EMAIL_VERIFICATION, MODERATOR_PERMISSIONS } from '$lib/constants';
import { currentUserFullQuery } from '$lib/server/queries';
import { transformUser } from '$lib/server/granular-permissions/transform';
import { hasAnyPermissions } from '$lib/server/granular-permissions/permissions';

export const load: LayoutServerLoad = async ({ locals }) => {
  const session = await locals.auth.validate();

  if (!session || (ENABLE_EMAIL_VERIFICATION && !session.user.verified)) {
    throw redirect(302, '/login');
  }

  const dbUser = await currentUserFullQuery.execute({ id: session.user.userId });

  if (!dbUser) throw error(404, 'auth.user-not-found');

  if (!dbUser.config) throw redirect(302, '/app/setup');

  const isModerator = hasAnyPermissions(transformUser(dbUser), MODERATOR_PERMISSIONS);

  return { user: dbUser, isModerator };
};
