import { can } from '$lib/server/granular-permissions/permissions';
import { toFullUser, toSafeGroup } from '$lib/server/granular-permissions/transform';
import { fullUserQuery, safeGroupsQuery } from '$lib/server/queries';
import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth.validate();
  const dbUser = await fullUserQuery.execute({ id: session.user.userId });

  if (!dbUser || dbUser.deleted) throw error(404, 'auth.user-not-found');

  if (!dbUser.config) throw redirect(302, '/app/setup');

  const fullUser = toFullUser(dbUser);

  if (!can(fullUser, 'read-list-user-groups')) throw error(403, 'forbidden');

  const perms = {
    canCreateGroups: can(fullUser, 'create-user-group'),
    canEditGroups: can(fullUser, 'update-user-group-details'),
    canViewRoles: can(fullUser, 'read-list-roles'),
    canViewUsers: can(fullUser, 'read-list-other-users'),
  };

  const groups = (await safeGroupsQuery.execute()).map(e => toSafeGroup(e));

  if (!perms.canViewUsers) {
    groups.map(e => {
      const res = e;
      res.users = [];
      return res;
    });
  }

  if (!perms.canViewRoles) {
    groups.map(e => {
      const res = e;
      res.roles = [];
      return res;
    });
  }

  return { perms, groups };
};
