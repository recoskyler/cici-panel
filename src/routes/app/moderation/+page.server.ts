import { ENABLE_EMAIL_VERIFICATION } from '$lib/constants';
import { currentUserFullQuery } from '$lib/server/queries';
import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { transformUser } from '$lib/server/granular-permissions/transform';
import { hasAnyPermissions } from '$lib/server/granular-permissions/permissions';

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

  const canManageUsers = hasAnyPermissions(fullUser, [
    'change-user-roles',
    'create-new-user',
    'delete-other-user',
    'update-other-user',
    'change-user-permissions',
    'change-user-roles',
    'read-list-other-users',
  ]);

  const canManageGroups = hasAnyPermissions(fullUser, [
    'change-user-group-permissions',
    'change-user-group-roles',
    'create-user-group',
    'delete-user-group',
    'update-user-group-details',
    'read-list-user-groups',
    'add-remove-user-group-members',
  ]);

  const canManageRoles = hasAnyPermissions(fullUser, [
    'create-role',
    'delete-role',
    'read-list-roles',
    'change-role-permissions',
  ]);

  return { canManageRoles, canManageGroups, canManageUsers };
};
