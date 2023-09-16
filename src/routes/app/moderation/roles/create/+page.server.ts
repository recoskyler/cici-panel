import {
  ENABLE_EMAIL_VERIFICATION,
  ENABLE_GRANULAR_PERMISSIONS,
  ENABLE_RATE_LIMIT,
} from '$lib/constants';
import { can, syncPermissionsToRole } from '$lib/server/granular-permissions/permissions';
import { toFullUser } from '$lib/server/granular-permissions/transform';
import {
  availableGroupsQuery,
  fullUserQuery,
  minOtherUsersQuery,
} from '$lib/server/queries';
import {
  redirect, error, fail,
} from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  type Permission,
  insertRoleSchema,
  type MinUser,
  type Group,
} from '$lib/db/types';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';
import { db } from '$lib/server/drizzle';
import {
  groupsToRoles, permissionsToRoles, role, usersToRoles,
} from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { syncGroupsToRole, syncUsersToRole } from '$lib/server/granular-permissions/roles';
import { roleCreateLimiter } from '$lib/server/limiter';

const schema = insertRoleSchema
  .extend({
    user: z.array(z.string().length(15)),
    group: z.array(z.string().uuid()),
    permission: z.array(z.string().uuid()),
  });

export const load: PageServerLoad = async event => {
  roleCreateLimiter.cookieLimiter?.preflight(event);

  const { locals } = event;
  const session = await locals.auth.validate();
  const dbUser = await fullUserQuery.execute({ id: session.user.userId });

  if (!dbUser || dbUser.deleted) throw error(404, 'auth.user-not-found');

  if (!dbUser.config) throw redirect(302, '/app/setup');

  const fullUser = toFullUser(dbUser);

  if (!can(fullUser, 'create-role')) throw error(403, 'forbidden');

  const userPerms = {
    canSetGroups: can(fullUser, ['read-list-user-groups', 'change-user-group-roles']),
    canSetUsers: can(fullUser, ['read-list-other-users', 'change-user-roles']),
    canSetPermissions: can(fullUser, ['read-list-permissions', 'change-role-permissions']),
  };

  const form = await superValidate(schema);

  let users: MinUser[] = [];
  let groups: Group[] = [];
  let permissions: Permission[] = [];

  if (userPerms.canSetUsers) {
    users = await minOtherUsersQuery.execute({ currentUserId: session.user.userId });
    users = users.filter(e => !e.deleted && e.verified);
  }

  if (userPerms.canSetGroups) {
    groups = await availableGroupsQuery.execute();
  }

  if (userPerms.canSetPermissions) {
    permissions = await db.query.permission.findMany();
  }

  return { permissions, users, groups, userPerms, form };
};

export const actions: Actions = {
  default: async event => {
    const { locals, request } = event;
    const session = await locals.auth.validate();
    const form = await superValidate(request, schema);

    if (!ENABLE_GRANULAR_PERMISSIONS) throw error(501, 'feature-disabled');

    if (!session || (ENABLE_EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, '/login');
    }

    if (ENABLE_RATE_LIMIT && await roleCreateLimiter.isLimited(event)) {
      return setError(
        form,
        '',
        'rate-limiter.too-fast-error',
      );
    }

    const dbUser = await fullUserQuery.execute({ id: session.user.userId });

    if (!dbUser) throw error(404, 'auth.user-not-found');

    if (!dbUser.config) throw redirect(302, '/app/setup');

    const fullUser = toFullUser(dbUser);

    if (!can(fullUser, 'create-role')) throw error(403, 'forbidden');

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { form });
    }

    let createdId = '';

    try {
      const [dbRole] = await db.insert(role).values({
        name: form.data.name,
        description: form.data.description,
      }).returning();

      createdId = dbRole.id;

      if (can(fullUser, 'change-user-roles')) {
        await syncUsersToRole(form.data.user, createdId);
      }

      if (can(fullUser, 'change-user-permissions')) {
        await syncPermissionsToRole(createdId, form.data.permission);
      }

      if (can(fullUser, 'change-user-group-roles')) {
        await syncGroupsToRole(form.data.group, createdId);
      }
    } catch (e) {
      console.error('Failed to create new user');
      console.error(e);

      if (createdId !== '') {
        await db.delete(permissionsToRoles).where(eq(permissionsToRoles.roleId, createdId));
        await db.delete(groupsToRoles).where(eq(groupsToRoles.roleId, createdId));
        await db.delete(usersToRoles).where(eq(usersToRoles.roleId, createdId));
        await db.delete(role).where(eq(role.id, createdId));
      }

      return setError(form, 'error.failed-to-create-new-role');
    }

    throw redirect(302, `/app/moderation/roles/${createdId}`);
  },
};
