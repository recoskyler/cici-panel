import {
  ENABLE_EMAIL_VERIFICATION,
  ENABLE_RATE_LIMIT,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '$lib/constants';
import { can, syncPermissionsToUser } from '$lib/server/granular-permissions/permissions';
import { toFullUser } from '$lib/server/granular-permissions/transform';
import {
  availableGroupsQuery, availableRolesQuery, fullUserQuery,
} from '$lib/server/queries';
import {
  redirect, error, fail,
} from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  type Group,
  type Permission,
  type Role,
  type NewUserConfig,
  insertUserSchema,
  innerInsertUserConfigSchema,
} from '$lib/db/types';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';
import { db } from '$lib/server/drizzle';
import { isPasswordValid } from '$lib/functions/validators';
import { auth } from '$lib/server/lucia';
import { userConfig } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { syncRolesByIdToUser } from '$lib/server/granular-permissions/roles';
import { syncGroupsToUser } from '$lib/server/granular-permissions/groups';
import { userCreateLimiter } from '$lib/server/limiter';

const schema = insertUserSchema
  .extend(innerInsertUserConfigSchema)
  .extend({
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
    group: z.array(z.string().uuid()),
    role: z.array(z.string().uuid()),
    permission: z.array(z.string().uuid()),
  });

export const load: PageServerLoad = async event => {
  userCreateLimiter.cookieLimiter?.preflight(event);

  const { locals } = event;
  const session = await locals.auth.validate();
  const dbUser = await fullUserQuery.execute({ id: session.user.userId });

  if (!dbUser || dbUser.deleted) throw error(404, 'auth.user-not-found');

  if (!dbUser.config) throw redirect(302, '/app/setup');

  const fullUser = toFullUser(dbUser);

  if (!can(fullUser, 'create-new-user')) throw error(403, 'forbidden');

  const userPerms = {
    canSetRoles: can(fullUser, ['read-list-roles', 'change-user-roles']),
    canSetPermissions: can(fullUser, ['read-list-permissions', 'change-user-permissions']),
    canSetGroups: can(fullUser, ['read-list-user-groups', 'add-remove-user-group-members']),
  };

  const form = await superValidate(schema);

  let groups: Group[] = [];
  let roles: Role[] = [];
  let permissions: Permission[] = [];

  if (userPerms.canSetGroups) {
    groups = await availableGroupsQuery.execute();
  }

  if (userPerms.canSetRoles) {
    roles = await availableRolesQuery.execute();

    const userRole = roles.find(e => e.name === 'User');

    if (userRole) form.data.role.push(userRole.id);
  }

  if (userPerms.canSetPermissions) {
    permissions = await db.query.permission.findMany();
  }

  return { permissions, groups, roles, userPerms, form };
};

export const actions: Actions = {
  default: async event => {
    const { locals, request } = event;
    const session = await locals.auth.validate();
    const form = await superValidate(request, schema);

    if (!session || (ENABLE_EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, '/login');
    }

    if (ENABLE_RATE_LIMIT && await userCreateLimiter.isLimited(event)) {
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

    if (!can(fullUser, 'create-new-user')) throw error(403, 'forbidden');

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { form });
    }

    if (!isPasswordValid(form.data.password)) {
      return setError(form, 'password', 'error.password-does-not-meet-the-requirements-or-too-weak');
    }

    let createdId = '';
    let configCreated = false;

    try {
      const user = await auth.createUser({
        key: {
          providerId: 'email',
          providerUserId: form.data.email.trim(),
          password: form.data.password,
        },
        attributes: {
          email: form.data.email.trim(),
          verified: form.data.verified,
        },
      });

      createdId = user.userId;

      const userConfigData: NewUserConfig = {
        userId: createdId,
        displayname: form.data.displayname.trim(),
        firstname: form.data.firstname.trim(),
        lastname: form.data.lastname ? form.data.lastname.trim() : undefined,
        mobile: form.data.mobile ? form.data.mobile.trim() : undefined,
      };

      await db.insert(userConfig).values(userConfigData);

      configCreated = true;

      if (can(fullUser, 'change-user-roles') && form.data.role.length > 0) {
        await syncRolesByIdToUser(createdId, form.data.role);
      }

      if (can(fullUser, 'change-user-permissions') && form.data.permission.length > 0) {
        await syncPermissionsToUser(createdId, form.data.permission);
      }

      if (can(fullUser, 'add-remove-user-group-members') && form.data.group.length > 0) {
        await syncGroupsToUser(form.data.group, createdId);
      }
    } catch (e) {
      console.error('Failed to create new user');
      console.error(e);

      if (configCreated) {
        await db.delete(userConfig).where(eq(userConfig.userId, createdId));
      }

      if (createdId !== '') {
        await auth.deleteUser(createdId);
      }

      return setError(form, 'error.failed-to-create-new-user');
    }

    throw redirect(302, `/app/moderation/users/${createdId}`);
  },
};
