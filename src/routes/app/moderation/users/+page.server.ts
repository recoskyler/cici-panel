import { can } from '$lib/server/granular-permissions/permissions';
import { toFullUser, toSafeUser } from '$lib/server/granular-permissions/transform';
import { fullUserQuery, safeAllUsersQuery } from '$lib/server/queries';
import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { SafeUser } from '$lib/db/types';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth.validate();
  const dbUser = await fullUserQuery.execute({ id: session.user.userId });

  if (!dbUser || dbUser.deleted) throw error(404, 'auth.user-not-found');

  if (!dbUser.config) throw redirect(302, '/app/setup');

  const fullUser = toFullUser(dbUser);

  if (!can(fullUser, 'read-list-other-users')) throw error(403, 'forbidden');

  const perms = {
    canCreateUsers: can(fullUser, 'create-new-user'),
    canEditUsers: can(fullUser, 'update-other-user'),
    canDeleteUsers: can(fullUser, 'delete-other-user'),
    canViewRoles: can(fullUser, 'read-list-roles'),
    canViewGroups: can(fullUser, 'read-list-user-groups'),
  };

  const users: SafeUser[] =
    (await safeAllUsersQuery.execute())
      .map(e => toSafeUser(e));

  if (!perms.canViewGroups) {
    users.map(e => {
      const res = e;
      res.groups = [];
      return res;
    });
  }

  if (!perms.canViewRoles) {
    users.map(e => {
      const res = e;

      res.allRoles = [];
      res.directRoles = [];

      res.groups = res.groups.map(g => {
        const resGroup = g;
        resGroup.roles = [];
        return resGroup;
      });

      return res;
    });
  }

  return { perms, users };
};
