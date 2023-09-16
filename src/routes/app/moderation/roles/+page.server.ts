import { can } from '$lib/server/granular-permissions/permissions';
import { toFullUser, toSafeRole } from '$lib/server/granular-permissions/transform';
import { fullUserQuery, safeRolesQuery } from '$lib/server/queries';
import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth.validate();
  const dbUser = await fullUserQuery.execute({ id: session.user.userId });

  if (!dbUser || dbUser.deleted) throw error(404, 'auth.user-not-found');

  if (!dbUser.config) throw redirect(302, '/app/setup');

  const fullUser = toFullUser(dbUser);

  if (!can(fullUser, 'read-list-roles')) throw error(403, 'forbidden');

  const perms = {
    canCreateRoles: can(fullUser, 'create-role'),
    canEditRoles: can(fullUser, ['change-role-permissions', 'update-role-details']),
    canViewGroups: can(fullUser, 'read-list-user-groups'),
    canViewUsers: can(fullUser, 'read-list-other-users'),
  };

  const roles = (await safeRolesQuery.execute()).map(e => toSafeRole(e));

  if (!perms.canViewUsers) {
    roles.map(e => {
      const res = e;
      res.users = [];
      return res;
    });
  }

  if (!perms.canViewGroups) {
    roles.map(e => {
      const res = e;
      res.groups = [];
      return res;
    });
  }

  return { perms, roles };
};
