import {
  ENABLE_EMAIL_VERIFICATION, ENABLE_GRANULAR_PERMISSIONS, ENABLE_RATE_LIMIT,
} from '$lib/constants';
import { can, syncPermissionsToGroup } from '$lib/server/granular-permissions/permissions';
import { toFullUser } from '$lib/server/granular-permissions/transform';
import {
  availableRolesQuery, fullUserQuery, minAllUsersQuery,
} from '$lib/server/queries';
import {
  redirect, error, fail,
} from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  type Permission,
  type Role,
  insertGroupSchema,
  type MinUser,
} from '$lib/db/types';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';
import { db } from '$lib/server/drizzle';
import {
  group, groupsToPermissions, groupsToRoles, usersToGroups,
} from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { syncRolesToGroup } from '$lib/server/granular-permissions/roles';
import { syncUsersToGroup } from '$lib/server/granular-permissions/groups';
import { groupCreateLimiter } from '$lib/server/limiter';

const schema = insertGroupSchema
  .extend({
    user: z.array(z.string().length(15)),
    role: z.array(z.string().uuid()),
    permission: z.array(z.string()),
  });

export const load: PageServerLoad = async event => {
  groupCreateLimiter.cookieLimiter?.preflight(event);

  const { locals } = event;
  const session = await locals.auth.validate();
  const dbUser = await fullUserQuery.execute({ id: session.user.userId });

  if (!dbUser || dbUser.deleted) throw error(404, 'auth.user-not-found');

  if (!dbUser.config) throw redirect(302, '/app/setup');

  const fullUser = toFullUser(dbUser);

  if (!can(fullUser, 'create-user-group')) throw error(403, 'forbidden');

  const userPerms = {
    canSetRoles: can(fullUser, ['read-list-roles', 'change-user-group-roles']),
    canSetUsers: can(fullUser, ['read-list-other-users', 'add-remove-user-group-members']),
    canSetPermissions: can(fullUser, ['read-list-permissions', 'change-user-group-permissions']),
  };

  const form = await superValidate(schema);

  let users: MinUser[] = [];
  let roles: Role[] = [];
  let permissions: Permission[] = [];

  if (userPerms.canSetUsers) {
    users = await minAllUsersQuery.execute();
    users = users.filter(e => !e.deleted && (e.verified || !ENABLE_EMAIL_VERIFICATION));
  }

  if (userPerms.canSetRoles) {
    roles = await availableRolesQuery.execute();
  }

  if (userPerms.canSetPermissions) {
    permissions = await db.query.permission.findMany();
  }

  return { permissions, users, roles, userPerms, form };
};

export const actions: Actions = {
  default: async event => {
    const { locals, request } = event;
    const session = await locals.auth.validate();
    const form = await superValidate(request, schema);

    if (!session || (ENABLE_EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, '/login');
    }

    if (ENABLE_RATE_LIMIT && await groupCreateLimiter.isLimited(event)) {
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

    if (!can(fullUser, 'create-user-group')) throw error(403, 'forbidden');

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { form });
    }

    let createdId = '';

    try {
      const [dbGroup] = await db.insert(group).values({
        name: form.data.name,
        description: form.data.description,
      }).returning();

      createdId = dbGroup.id;

      if (can(fullUser, 'change-user-group-roles')
        && form.data.role.length > 0 && ENABLE_GRANULAR_PERMISSIONS
      ) {
        await syncRolesToGroup(createdId, form.data.role);
      }

      if (can(fullUser, 'change-user-permissions')
        && form.data.permission.length > 0 && ENABLE_GRANULAR_PERMISSIONS
      ) {
        await syncPermissionsToGroup(createdId, form.data.permission);
      }

      if (can(fullUser, 'add-remove-user-group-members') && form.data.user.length > 0) {
        await syncUsersToGroup(form.data.user, createdId);
      }
    } catch (e) {
      console.error('Failed to create new group');
      console.error(e);

      if (createdId !== '') {
        await db.delete(groupsToPermissions).where(eq(groupsToPermissions.groupId, createdId));
        await db.delete(groupsToRoles).where(eq(groupsToRoles.groupId, createdId));
        await db.delete(usersToGroups).where(eq(usersToGroups.groupId, createdId));
        await db.delete(group).where(eq(group.id, createdId));
      }

      return setError(form, 'error.failed-to-create-new-group');
    }

    throw redirect(302, `/app/moderation/groups/${createdId}`);
  },
};
