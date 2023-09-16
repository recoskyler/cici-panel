import { fullUserQuery } from '$lib/server/queries';
import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { toFullUser } from '$lib/server/granular-permissions/transform';
import { can, hasAnyPermissions } from '$lib/server/granular-permissions/permissions';
import { MODERATOR_PERMISSIONS } from '$lib/server/constants';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth.validate();
  const dbUser = await fullUserQuery.execute({ id: session.user.userId });

  if (!dbUser || dbUser.deleted) throw error(404, 'auth.user-not-found');

  if (!dbUser.config) throw redirect(302, '/app/setup');

  const fullUser = toFullUser(dbUser);

  if (!can(fullUser, MODERATOR_PERMISSIONS)) throw error(403, 'forbidden');

  const perms = {
    canManageUsers: hasAnyPermissions(fullUser, [
      'change-user-roles',
      'create-new-user',
      'delete-other-user',
      'update-other-user',
      'change-user-permissions',
      'change-user-roles',
      'read-list-other-users',
    ]),
    canManageGroups: hasAnyPermissions(fullUser, [
      'change-user-group-permissions',
      'change-user-group-roles',
      'create-user-group',
      'delete-user-group',
      'update-user-group-details',
      'read-list-user-groups',
      'add-remove-user-group-members',
    ]),
    canManageRoles: hasAnyPermissions(fullUser, [
      'create-role',
      'delete-role',
      'read-list-roles',
      'change-role-permissions',
    ]),
  };

  return { perms };
};
