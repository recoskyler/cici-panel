import {
  ENABLE_EMAIL_VERIFICATION,
  ENABLE_GRANULAR_PERMISSIONS,
  ENABLE_RATE_LIMIT,
} from '$lib/constants';
import { can, syncPermissionsToGroup } from '$lib/server/granular-permissions/permissions';
import {
  toFullGroup, toFullUser, toSafeGroup,
} from '$lib/server/granular-permissions/transform';
import {
  availableRolesQuery, fullGroupQuery, fullUserQuery, minOtherUsersQuery, safeGroupQuery,
} from '$lib/server/queries';
import {
  redirect, error, fail,
} from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  type Permission,
  type Role,
  insertGroupSchema,
  type FullDatabaseGroup,
  type MinUser,
  type FullGroup,
} from '$lib/db/types';
import {
  message,
  setError,
  superValidate,
} from 'sveltekit-superforms/server';
import { z } from 'zod';
import { db } from '$lib/server/drizzle';
import {
  group,
  groupsToPermissions,
  groupsToRoles,
  usersToGroups,
} from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { syncRolesByIdToGroup } from '$lib/server/granular-permissions/roles';
import { syncUsersToGroup } from '$lib/server/granular-permissions/groups';
import { groupUpdateLimiter } from '$lib/server/limiter';

const deleteSchema = z.object({});
const permDeleteSchema = z.object({});
const restoreSchema = z.object({});

const schema = insertGroupSchema
  .extend({
    user: z.array(z.string().length(15)),
    role: z.array(z.string().uuid()),
    permission: z.array(z.string().uuid()),
  });

export const load: PageServerLoad = async event => {
  groupUpdateLimiter.cookieLimiter?.preflight(event);

  const { locals, params } = event;
  const session = await locals.auth.validate();
  const dbUser = await fullUserQuery.execute({ id: session.user.userId });

  if (!dbUser || dbUser.deleted) throw error(404, 'auth.user-not-found');

  if (!dbUser.config) throw redirect(302, '/app/setup');

  const fullUser = toFullUser(dbUser);

  if (!can(fullUser, ['read-list-user-groups', 'update-user-group-details'])) {
    throw error(403, 'forbidden');
  }

  const userPerms = {
    canDelete: can(fullUser, 'delete-user-group'),
    canSetRoles: can(fullUser, ['read-list-roles', 'change-user-group-roles']),
    canSetUsers: can(fullUser, ['read-list-other-users', 'add-remove-user-group-members']),
    canSetPermissions: can(fullUser, ['read-list-permissions', 'change-user-group-permissions']),
  };

  const dbGroup = userPerms.canSetPermissions
    ? await fullGroupQuery.execute({ id: params.id })
    : await safeGroupQuery.execute({ id: params.id });

  if (!dbGroup) throw error(404, 'error.not-found');

  const selectedGroup = userPerms.canSetPermissions
    ? toFullGroup(dbGroup as FullDatabaseGroup)
    : toSafeGroup(dbGroup);

  const form = await superValidate(schema);
  const deleteForm = await superValidate(deleteSchema, { id: 'delete-form' });
  const permDeleteForm = await superValidate(permDeleteSchema, { id: 'perm-delete-form' });
  const restoreForm = await superValidate(restoreSchema, { id: 'restore-form' });

  let users: MinUser[] = [];
  let roles: Role[] = [];
  let permissions: Permission[] = [];

  if (userPerms.canSetUsers) {
    users = await minOtherUsersQuery.execute({ currentUserId: session.user.userId });
    users = users.filter(e => !e.deleted && e.verified);
  } else {
    selectedGroup.users = [];
  }

  if (userPerms.canSetRoles) {
    roles = await availableRolesQuery.execute();
    form.data.role = selectedGroup.roles.map(e => e.id);
  } else {
    selectedGroup.roles = [];
  }

  if (userPerms.canSetPermissions) {
    permissions = await db.query.permission.findMany();
    form.data.permission = (selectedGroup as FullGroup).permissions.map(e => e.name);
  }

  form.data.name = selectedGroup.name;
  form.data.description = selectedGroup.description;

  return {
    permissions,
    users,
    roles,
    userPerms,
    form,
    deleteForm,
    permDeleteForm,
    restoreForm,
    group: selectedGroup,
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

    if (ENABLE_RATE_LIMIT && await groupUpdateLimiter.isLimited(event)) {
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

    if (!can(fullUser, 'update-user-group-details')) throw error(403, 'forbidden');

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { form });
    }

    try {
      await db.update(group).set({
        name: form.data.name,
        description: form.data.description,
      });

      if (can(fullUser, ['read-list-roles', 'change-user-group-roles'])
        && ENABLE_GRANULAR_PERMISSIONS
      ) {
        await syncRolesByIdToGroup(params.id, form.data.role);
      }

      if (can(fullUser, 'change-user-permissions')
        && ENABLE_GRANULAR_PERMISSIONS
      ) {
        await syncPermissionsToGroup(params.id, form.data.permission);
      }

      if (can(fullUser, 'add-remove-user-group-members')) {
        await syncUsersToGroup(form.data.user, params.id);
      }
    } catch (e) {
      console.error('Failed to update group');
      console.error(e);

      return setError(form, 'error.failed-to-save-changes');
    }

    return message(form, 'group-details-changed-successfully');
  },
  delete: async event => {
    const { locals, params, request } = event;
    const session = await locals.auth.validate();

    if (!session || (ENABLE_EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, '/login');
    }

    const form = await superValidate(request, deleteSchema);

    if (ENABLE_RATE_LIMIT && await groupUpdateLimiter.isLimited(event)) {
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

    if (!can(fullUser, 'delete-user-group')) throw error(403, 'forbidden');

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { deleteForm: form });
    }

    try {
      const dbGroup = await db.query.group
        .findFirst({
          where: ((g, { eq, and }) =>
            and(eq(g.id, params.id), eq(g.deleted, false))),
        });

      if (!dbGroup) {
        return setError(
          form,
          '',
          'error.group-not-found',
        );
      }

      await db.update(group).set({ deleted: true }).where(eq(group.id, params.id));
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

    if (ENABLE_RATE_LIMIT && await groupUpdateLimiter.isLimited(event)) {
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

    if (!can(fullUser, 'delete-user-group')) throw error(403, 'forbidden');

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { restoreForm: form });
    }

    try {
      const dbGroup = await db.query.group
        .findFirst({
          where: ((g, { eq, and }) =>
            and(eq(g.id, params.id), eq(g.deleted, true))),
        });

      if (!dbGroup) {
        return setError(
          form,
          '',
          'error.group-not-found',
        );
      }

      await db.update(group).set({ deleted: false }).where(eq(group.id, params.id));
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

    if (ENABLE_RATE_LIMIT && await groupUpdateLimiter.isLimited(event)) {
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

    if (!can(fullUser, 'delete-user-group')) throw error(403, 'forbidden');

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { permDeleteForm: form });
    }

    try {
      const dbGroup = await db.query.group
        .findFirst({
          where: ((g, { eq, and }) =>
            and(eq(g.id, params.id), eq(g.deleted, true))),
        });

      if (!dbGroup) {
        return setError(
          form,
          '',
          'error.group-not-found',
        );
      }

      await db.delete(usersToGroups).where(eq(usersToGroups.groupId, params.id));
      await db.delete(groupsToPermissions).where(eq(groupsToPermissions.groupId, params.id));
      await db.delete(groupsToRoles).where(eq(groupsToRoles.groupId, params.id));
      await db.delete(group).where(eq(group.id, params.id));
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
