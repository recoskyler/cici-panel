import {
  ENABLE_EMAIL_VERIFICATION,
  ENABLE_RATE_LIMIT,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '$lib/constants';
import { can, syncPermissionsToUser } from '$lib/server/granular-permissions/permissions';
import { toFullUser, toSafeUser } from '$lib/server/granular-permissions/transform';
import {
  availableGroupsQuery, availableRolesQuery, fullUserQuery, safeUserQuery,
} from '$lib/server/queries';
import {
  redirect, error, fail,
} from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
  type Group,
  type Permission,
  type Role,
  insertUserSchema,
  innerInsertUserConfigSchema,
  type FullDatabaseUser,
  type FullUser,
} from '$lib/db/types';
import {
  message,
  setError,
  superValidate,
} from 'sveltekit-superforms/server';
import { z } from 'zod';
import { db } from '$lib/server/drizzle';
import { isPasswordValid } from '$lib/functions/validators';
import {
  user, userConfig, usersToGroups, usersToPermissions, usersToRoles,
} from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { syncRolesByIdToUser } from '$lib/server/granular-permissions/roles';
import { syncGroupsToUser } from '$lib/server/granular-permissions/groups';
import { auth } from '$lib/server/lucia';
import { userUpdateLimiter } from '$lib/server/limiter';

const deleteSchema = z.object({});
const permDeleteSchema = z.object({});
const restoreSchema = z.object({});

const schema = insertUserSchema
  .extend(innerInsertUserConfigSchema)
  .extend({
    password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH).optional(),
    group: z.array(z.string().uuid()),
    role: z.array(z.string().uuid()),
    permission: z.array(z.string().uuid()),
  });

export const load: PageServerLoad = async event => {
  userUpdateLimiter.cookieLimiter?.preflight(event);

  const { locals, params } = event;

  const session = await locals.auth.validate();
  const dbUser = await fullUserQuery.execute({ id: session.user.userId });

  if (!dbUser || dbUser.deleted) throw error(404, 'auth.user-not-found');

  if (!dbUser.config) throw redirect(302, '/app/setup');

  const fullUser = toFullUser(dbUser);

  if (!can(fullUser, ['read-list-other-users', 'update-other-user'])) {
    throw error(403, 'forbidden');
  }

  const userPerms = {
    canDelete: can(fullUser, 'delete-other-user'),
    canSetRoles: can(fullUser, ['read-list-roles', 'change-user-roles']),
    canSetPermissions: can(fullUser, ['read-list-permissions', 'change-user-permissions']),
    canSetGroups: can(fullUser, ['read-list-user-groups', 'add-remove-user-group-members']),
  };

  const dbSelectedUser = userPerms.canSetPermissions
    ? await fullUserQuery.execute({ id: params.id })
    : await safeUserQuery.execute({ id: params.id });

  if (!dbSelectedUser) throw error(404, 'auth.user-not-found');

  const selectedUser = userPerms.canSetPermissions
    ? toFullUser(dbSelectedUser as FullDatabaseUser)
    : toSafeUser(dbSelectedUser);

  const form = await superValidate(schema);
  const deleteForm = await superValidate(deleteSchema, { id: 'delete-form' });
  const permDeleteForm = await superValidate(permDeleteSchema, { id: 'perm-delete-form' });
  const restoreForm = await superValidate(restoreSchema, { id: 'restore-form' });

  let groups: Group[] = [];
  let roles: Role[] = [];
  let permissions: Permission[] = [];

  if (userPerms.canSetGroups) {
    groups = await availableGroupsQuery.execute();
    form.data.group = selectedUser.groups.map(e => e.id);
  } else {
    selectedUser.groups = [];
  }

  if (userPerms.canSetRoles) {
    roles = await availableRolesQuery.execute();
    form.data.role = selectedUser.directRoles.map(e => e.id);
  } else {
    selectedUser.allRoles = [];
    selectedUser.directRoles = [];

    selectedUser.groups = selectedUser.groups.map(e => {
      const res = e;
      res.roles = [];
      return res;
    });
  }

  if (userPerms.canSetPermissions) {
    permissions = await db.query.permission.findMany();
    form.data.permission = (selectedUser as FullUser).directPermissions.map(e => e.name);
  }

  form.data.displayname = selectedUser.config.displayname;
  form.data.firstname = selectedUser.config.firstname;
  form.data.lastname = selectedUser.config.lastname;
  form.data.mobile = selectedUser.config.mobile;
  form.data.verified = selectedUser.verified;
  form.data.email = selectedUser.email;

  return {
    permissions,
    groups,
    roles,
    userPerms,
    form,
    deleteForm,
    permDeleteForm,
    restoreForm,
    user: selectedUser,
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

    if (ENABLE_RATE_LIMIT && await userUpdateLimiter.isLimited(event)) {
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

    if (form.data.password && !isPasswordValid(form.data.password)) {
      return setError(form, 'password', 'error.password-does-not-meet-the-requirements-or-too-weak');
    }

    try {
      const dbSelectedUser = await fullUserQuery.execute({ id: params.id });

      if (!dbSelectedUser) throw error(404, 'auth.user-not-found');

      if (dbSelectedUser.email !== form.data.email.trim() && !form.data.password) {
        return setError(
          form,
          'password',
          'error.password-required-on-email-change',
        );
      }

      if (dbSelectedUser.email !== form.data.email.trim()) {
        await auth.invalidateAllUserSessions(params.id);
        await auth.updateUserAttributes(
          params.id,
          { email: form.data.email.trim() },
        );
        await auth.deleteKey('email', params.id);
      }

      await auth.updateUserAttributes(
        params.id,
        { verified: form.data.verified },
      );

      if (form.data.password) {
        await auth.updateKeyPassword('email', form.data.email.trim(), form.data.password);
      }

      await db.update(userConfig).set({
        displayname: form.data.displayname.trim(),
        firstname: form.data.firstname.trim(),
        lastname: form.data.lastname ? form.data.lastname.trim() : undefined,
        mobile: form.data.mobile ? form.data.mobile.trim() : undefined,
      }).where(eq(userConfig.userId, params.id));

      if (can(fullUser, 'change-user-roles')) {
        await syncRolesByIdToUser(params.id, form.data.role);
      }

      if (can(fullUser, 'change-user-permissions')) {
        await syncPermissionsToUser(params.id, form.data.permission);
      }

      if (can(fullUser, 'add-remove-user-group-members')) {
        await syncGroupsToUser(form.data.group, params.id);
      }
    } catch (e) {
      console.error('Failed to update user');
      console.error(e);

      return setError(form, 'error.failed-to-save-changes');
    }

    return message(form, 'user-details-changed-successfully');
  },
  delete: async event => {
    const { locals, params, request } = event;
    const session = await locals.auth.validate();

    if (!session || (ENABLE_EMAIL_VERIFICATION && !session.user.verified)) {
      throw redirect(302, '/login');
    }

    const form = await superValidate(request, deleteSchema);

    if (ENABLE_RATE_LIMIT && await userUpdateLimiter.isLimited(event)) {
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

    if (!can(fullUser, 'delete-other-user')) throw error(403, 'forbidden');

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { deleteForm: form });
    }

    try {
      const dbUser = await db.query.user
        .findFirst({
          where: ((u, { eq, and }) =>
            and(eq(u.id, params.id), eq(u.deleted, false))),
        });

      if (!dbUser) {
        return setError(
          form,
          '',
          'auth.user-not-found',
        );
      }

      await db.update(user).set({ deleted: true }).where(eq(user.id, params.id));
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

    if (ENABLE_RATE_LIMIT && await userUpdateLimiter.isLimited(event)) {
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

    if (!can(fullUser, 'delete-other-user')) throw error(403, 'forbidden');

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { restoreForm: form });
    }

    try {
      const dbUser = await db.query.user
        .findFirst({
          where: ((u, { eq, and }) =>
            and(eq(u.id, params.id), eq(u.deleted, true))),
        });

      if (!dbUser) {
        return setError(
          form,
          '',
          'auth.user-not-found',
        );
      }

      await db.update(user).set({ deleted: false }).where(eq(user.id, params.id));
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

    if (ENABLE_RATE_LIMIT && await userUpdateLimiter.isLimited(event)) {
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

    if (!can(fullUser, 'delete-other-user')) throw error(403, 'forbidden');

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { permDeleteForm: form });
    }

    try {
      const dbUser = await db.query.user
        .findFirst({
          where: ((u, { eq, and }) =>
            and(eq(u.id, params.id), eq(u.deleted, true))),
        });

      if (!dbUser) {
        return setError(
          form,
          '',
          'auth.user-not-found',
        );
      }

      await db.delete(userConfig).where(eq(userConfig.userId, params.id));

      await db.delete(usersToGroups).where(eq(usersToGroups.userId, params.id));
      await db.delete(usersToRoles).where(eq(usersToRoles.userId, params.id));
      await db.delete(usersToPermissions).where(eq(usersToPermissions.userId, params.id));

      // TODO: Delete other user data here

      await auth.deleteUser(params.id);
      await auth.invalidateAllUserSessions(params.id);
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
