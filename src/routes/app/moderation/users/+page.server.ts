import { ENABLE_EMAIL_VERIFICATION } from '$lib/constants';
import { hasPermission } from '$lib/server/granular-permissions/permissions';
import { transformUser } from '$lib/server/granular-permissions/transform';
import { currentUserFullQuery } from '$lib/server/queries';
import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/drizzle';
import { user } from '$lib/db/schema';
import { ne } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth.validate();

  if (!session) throw redirect(302, '/login');

  if (ENABLE_EMAIL_VERIFICATION && !session.user.verified) {
    throw redirect(302, '/email-verification');
  }

  const dbUser = await currentUserFullQuery.execute({ id: session.user.userId });

  if (!dbUser) throw error(404, 'auth.user-not-found');

  if (!dbUser.config) throw redirect(302, '/app/setup');

  const fullUser = transformUser(dbUser);

  const canViewUsers = hasPermission(fullUser, 'read-list-other-users');
  const canCreateUsers = hasPermission(fullUser, 'create-new-user');
  const canViewRoles = hasPermission(fullUser, 'read-list-roles');
  const canViewGroups = hasPermission(fullUser, 'read-list-user-groups');

  let users;

  if (canViewUsers) {
    users = await db.query.user.findMany({
      where: ne(user.id, session.user.userId),
      with: {
        config: true,
        usersToGroups: canViewGroups
          ? {
            with: {
              group: {
                with: {
                  groupsToRoles: canViewRoles
                    ? { with: { role: true } }
                    : undefined,
                },
              },
            },
          }
          : undefined,
        usersToRoles: canViewRoles
          ? { with: { role: true } }
          : undefined,
      },
    });
  }

  return { canViewUsers, canCreateUsers, canViewRoles, users };
};
