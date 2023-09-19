import {
  ENABLE_EMAIL_VERIFICATION,
  ENABLE_RATE_LIMIT,
} from '$lib/constants';
import { can, syncPermissionsToRole } from '$lib/server/granular-permissions/permissions';
import {
  toFullRole, toFullUser, toSafeRole,
} from '$lib/server/granular-permissions/transform';
import {
  availableGroupsQuery,
  fullRoleQuery,
  fullUserQuery,
  minAllUsersQuery,
  safeRoleQuery,
} from '$lib/server/queries';
import {
  redirect, error, fail,
} from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  type Permission,
  insertRoleSchema,
  type FullDatabaseRole,
  type MinUser,
  type FullRole,
  type Group,
} from '$lib/db/types';
import {
  message,
  setError,
  superValidate,
} from 'sveltekit-superforms/server';
import { z } from 'zod';
import { db } from '$lib/server/drizzle';
import {
  role,
  permissionsToRoles,
  groupsToRoles,
  usersToRoles,
} from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { roleUpdateLimiter } from '$lib/server/limiter';
import { syncUsersToRole, syncGroupsToRole } from '$lib/server/granular-permissions/roles';

const deleteSchema = z.object({});
const permDeleteSchema = z.object({});
const restoreSchema = z.object({});

const schema = insertRoleSchema
  .extend({
    user: z.array(z.string().length(15)),
    group: z.array(z.string().uuid()),
    permission: z.array(z.string()),
  });

export const load: PageServerLoad = async event => {
  roleUpdateLimiter.cookieLimiter?.preflight(event);

  const { locals, params } = event;
  const session = await locals.auth.validate();
  const dbUser = await fullUserQuery.execute({ id: session.user.userId });

  if (!dbUser || dbUser.deleted) throw error(404, 'auth.user-not-found');

  if (!dbUser.config) throw redirect(302, '/app/setup');

  const fullUser = toFullUser(dbUser);

  if (!can(fullUser, ['read-list-roles', 'update-role-details'])) {
    throw error(403, 'forbidden');
  }

  const userPerms = {
    canDelete: can(fullUser, 'delete-role'),
    canSetGroups: can(fullUser, ['read-list-user-groups', 'change-user-group-roles']),
    canSetUsers: can(fullUser, ['read-list-other-users', 'change-user-roles']),
    canSetPermissions: can(fullUser, ['read-list-permissions', 'change-role-permissions']),
  };

  const dbRole = userPerms.canSetPermissions
    ? await fullRoleQuery.execute({ id: params.id })
    : await safeRoleQuery.execute({ id: params.id });

  if (!dbRole) throw error(404, 'error.not-found');

  const selectedRole = userPerms.canSetPermissions
    ? toFullRole(dbRole as FullDatabaseRole)
    : toSafeRole(dbRole);

  const form = await superValidate(schema);
  const deleteForm = await superValidate(deleteSchema, { id: 'delete-form' });
  const permDeleteForm = await superValidate(permDeleteSchema, { id: 'perm-delete-form' });
  const restoreForm = await superValidate(restoreSchema, { id: 'restore-form' });

  let users: MinUser[] = [];
  let groups: Group[] = [];
  let permissions: Permission[] = [];

  if (userPerms.canSetUsers) {
    users = await minAllUsersQuery.execute();
    users = users.filter(e => !e.deleted && (e.verified || !ENABLE_EMAIL_VERIFICATION));
  } else {
    selectedRole.users = [];
  }

  if (userPerms.canSetGroups) {
    groups = await availableGroupsQuery.execute();
    form.data.group = selectedRole.groups.map(e => e.id);
  } else {
    selectedRole.groups = [];
  }

  if (userPerms.canSetPermissions) {
    permissions = await db.query.permission.findMany();
    form.data.permission = (selectedRole as FullRole).permissions.map(e => e.name);
  }

  form.data.name = selectedRole.name;
  form.data.description = selectedRole.description;
  form.data.user = selectedRole.users.map(e => e.id);
  form.data.group = selectedRole.groups.map(e => e.id);

  console.log(form.data);

  return {
    permissions,
    users,
    groups,
    userPerms,
    form,
    deleteForm,
    permDeleteForm,
    restoreForm,
    role: selectedRole,
  };
};

export const actions: Actions = {
  save: async event => {
    const { locals, request, params } = event;
    const session = await locals.auth.validate();

    if (!session || (ENABLE_EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, '/login');
    }

    const form = await superValidate(request, schema);

    if (ENABLE_RATE_LIMIT && await roleUpdateLimiter.isLimited(event)) {
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

    if (!can(fullUser, 'update-role-details')) throw error(403, 'forbidden');

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      console.error(form.data);
      return fail(400, { form });
    }

    try {
      const [dbRole] = await db.update(role).set({
        name: form.data.name,
        description: form.data.description,
      }).where(eq(role.id, params.id)).returning();

      if (can(fullUser, 'change-user-roles')) {
        await syncUsersToRole(
          form.data.user,
          params.id,
        );
      }

      if (can(fullUser, 'change-role-permissions') && !dbRole.protected) {
        await syncPermissionsToRole(params.id, form.data.permission);
      }

      if (can(fullUser, 'change-user-group-roles')) {
        await syncGroupsToRole(form.data.group, params.id);
      }
    } catch (e) {
      console.error('Failed to update role');
      console.error(e);
      console.error(form.data);

      return setError(form, 'error.failed-to-save-changes');
    }

    return message(form, 'role-details-changed-successfully');
  },
  delete: async event => {
    const { locals, params, request } = event;
    const session = await locals.auth.validate();

    if (!session || (ENABLE_EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, '/login');
    }

    const form = await superValidate(request, deleteSchema);

    if (ENABLE_RATE_LIMIT && await roleUpdateLimiter.isLimited(event)) {
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

    if (!can(fullUser, 'delete-role')) throw error(403, 'forbidden');

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { deleteForm: form });
    }

    try {
      const dbRole = await db.query.role
        .findFirst({
          where: ((g, { eq, and }) =>
            and(eq(g.id, params.id), eq(g.deleted, false))),
        });

      if (!dbRole) {
        return setError(
          form,
          '',
          'error.role-not-found',
        );
      }

      if (dbRole?.protected) throw error(403, 'forbidden');

      await db.update(role).set({ deleted: true }).where(eq(role.id, params.id));
    } catch (e) {
      return setError(
        form,
        '',
        'error.failed-to-delete-user',
      );
    }

    return { deleteForm: form };
  },
  restore: async event => {
    const { locals, params, request } = event;
    const session = await locals.auth.validate();

    if (!session || (ENABLE_EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, '/login');
    }

    const form = await superValidate(request, restoreSchema);

    if (ENABLE_RATE_LIMIT && await roleUpdateLimiter.isLimited(event)) {
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

    if (!can(fullUser, 'delete-role')) throw error(403, 'forbidden');

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { restoreForm: form });
    }

    try {
      const dbRole = await db.query.role
        .findFirst({
          where: ((g, { eq, and }) =>
            and(eq(g.id, params.id), eq(g.deleted, true))),
        });

      if (!dbRole) {
        return setError(
          form,
          '',
          'error.role-not-found',
        );
      }

      await db.update(role).set({ deleted: false }).where(eq(role.id, params.id));
    } catch (e) {
      return setError(
        form,
        '',
        'error.failed-to-restore-user',
      );
    }

    return { restoreForm: form };
  },
  permanentlyDelete: async event => {
    const { locals, params, request } = event;
    const session = await locals.auth.validate();

    if (!session || (ENABLE_EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, '/login');
    }

    const form = await superValidate(request, permDeleteSchema);

    if (ENABLE_RATE_LIMIT && await roleUpdateLimiter.isLimited(event)) {
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

    if (!can(fullUser, 'delete-role')) throw error(403, 'forbidden');

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { permDeleteForm: form });
    }

    try {
      const dbRole = await db.query.role
        .findFirst({
          where: ((g, { eq, and }) =>
            and(eq(g.id, params.id), eq(g.deleted, true))),
        });

      if (!dbRole) {
        return setError(
          form,
          '',
          'error.role-not-found',
        );
      }

      if (dbRole?.protected) throw error(403, 'forbidden');

      await db.delete(usersToRoles).where(eq(usersToRoles.roleId, params.id));
      await db.delete(permissionsToRoles).where(eq(permissionsToRoles.roleId, params.id));
      await db.delete(groupsToRoles).where(eq(groupsToRoles.roleId, params.id));
      await db.delete(role).where(eq(role.id, params.id));
    } catch (e) {
      return setError(
        form,
        '',
        'error.failed-to-permanently-delete-user',
      );
    }

    throw redirect(302, '/app/moderation/users');
  },
};
