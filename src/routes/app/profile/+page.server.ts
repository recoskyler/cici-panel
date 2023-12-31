import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { type Actions, fail } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import {
  DISCLAIMER_DISMISSED_COOKIE_NAME,
  MAX_EMAIL_LENGTH,
  MAX_FIRST_NAME_LENGTH,
  MAX_LAST_NAME_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_EMAIL_LENGTH,
  MIN_FIRST_NAME_LENGTH,
  MIN_LAST_NAME_LENGTH,
  MIN_DISPLAY_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_MOBILE_LENGTH,
  MAX_MOBILE_LENGTH,
  ENABLE_RATE_LIMIT,
} from '$lib/constants';
import { z } from 'zod';
import {
  message, setError, superValidate,
} from 'sveltekit-superforms/server';
import { LuciaError } from 'lucia';
import { db } from '$lib/server/drizzle';
import {
  userConfig, usersToGroups, usersToPermissions, usersToRoles,
} from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { profileUpdateLimiter } from '$lib/server/limiter';
import { fullUserQuery } from '$lib/server/queries';
import { toFullUser } from '$lib/server/granular-permissions/transform';
import { can } from '$lib/server/granular-permissions/permissions';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
});

const changeEmailSchema = z.object({
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
  email: z.string().email().min(MIN_EMAIL_LENGTH).max(MAX_EMAIL_LENGTH),
});

const deleteAccountSchema = z.object({
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
  confirmation: z.string().min(1).max(16),
});

const changeUserConfigSchema = z.object({
  displayname: z.string().min(MIN_DISPLAY_NAME_LENGTH).max(MAX_DISPLAY_NAME_LENGTH),
  firstname: z.string().min(MIN_FIRST_NAME_LENGTH).max(MAX_FIRST_NAME_LENGTH),
  lastname: z.string().min(MIN_LAST_NAME_LENGTH).max(MAX_LAST_NAME_LENGTH).nullable(),
  mobile: z.string().min(MIN_MOBILE_LENGTH).max(MAX_MOBILE_LENGTH).nullable(),
});

export const actions: Actions = {
  signOut: async ({ locals, cookies }) => {
    const session = await locals.auth.validate();

    cookies.delete(DISCLAIMER_DISMISSED_COOKIE_NAME);

    if (!session) return fail(401);

    await auth.invalidateSession(session.sessionId); // invalidate session

    locals.auth.setSession(null); // remove cookie
  },
  delete: async ({ locals, request }) => {
    const session = await locals.auth.validate();

    if (!session) return fail(401);

    const dbUser = await fullUserQuery.execute({ id: session.user.userId });

    if (!dbUser || dbUser.deleted) throw error(404, 'auth.user-not-found');

    if (!dbUser.config) throw redirect(302, '/app/setup');

    const fullUser = toFullUser(dbUser);

    if (!can(fullUser, 'change-own-user-details')) throw error(403, 'forbidden');

    const form = await superValidate(request, deleteAccountSchema);

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { deleteAccountForm: form });
    }

    if (form.data.confirmation !== 'Delete') {
      return setError(form, '', 'you-must-type-delete-error');
    }

    try {
      await auth.useKey('email', fullUser.email, form.data.password);

      await db.delete(userConfig).where(eq(userConfig.userId, session.user.userId));

      await db.delete(usersToGroups).where(eq(usersToGroups.userId, session.user.userId));
      await db.delete(usersToRoles).where(eq(usersToRoles.userId, session.user.userId));
      await db.delete(usersToPermissions).where(eq(usersToPermissions.userId, session.user.userId));

      // TODO: Delete other user data here

      await auth.deleteUser(session.user.userId);
      await auth.invalidateSession(session.sessionId);
    } catch (e) {
      if (e instanceof LuciaError && e.message === 'AUTH_INVALID_PASSWORD') {
        return setError(form, '', 'invalid-current-password');
      }

      return fail(500, { error: 'failed-to-delete-account' });
    }

    locals.auth.setSession(null);

    return message(form, 'account-deleted-successfully');
  },
  changePassword: async event => {
    const { locals, request } = event;
    const session = await locals.auth.validate();

    if (!session) return fail(401);

    const form = await superValidate(request, changePasswordSchema);

    if (ENABLE_RATE_LIMIT && await profileUpdateLimiter.isLimited(event)) {
      return setError(
        form,
        '',
        'rate-limiter.too-fast-error',
      );
    }

    const dbUser = await fullUserQuery.execute({ id: session.user.userId });

    if (!dbUser || dbUser.deleted) throw error(404, 'auth.user-not-found');

    if (!dbUser.config) throw redirect(302, '/app/setup');

    const fullUser = toFullUser(dbUser);

    if (!can(fullUser, 'change-own-password')) throw error(403, 'forbidden');

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { changePasswordForm: form });
    }

    if (form.data.currentPassword === form.data.password) {
      return setError(form, '', 'new-password-cannot-be-the-same-as-the-current-password');
    }

    try {
      await auth.useKey('email', session.user.email, form.data.currentPassword);
      await auth.invalidateAllUserSessions(session.user.userId);
      await auth.updateKeyPassword('email', session.user.email, form.data.password);

      const newSession = await auth.createSession({ userId: session.user.userId, attributes: {} });

      locals.auth.setSession(newSession);
    } catch (e) {
      if (e instanceof LuciaError && e.message === 'AUTH_INVALID_PASSWORD') {
        return setError(form, '', 'invalid-current-password');
      }

      console.error('Unable to change password');
      console.error(e);

      return setError(form, '', 'unable-to-change-password');
    }

    return message(form, 'password-changed-successfully');
  },
  changeEmail: async event => {
    const { locals, request } = event;
    const session = await locals.auth.validate();

    if (!session) return fail(401);

    const form = await superValidate(request, changeEmailSchema);

    if (ENABLE_RATE_LIMIT && await profileUpdateLimiter.isLimited(event)) {
      return setError(
        form,
        '',
        'rate-limiter.too-fast-error',
      );
    }

    const dbUser = await fullUserQuery.execute({ id: session.user.userId });

    if (!dbUser || dbUser.deleted) throw error(404, 'auth.user-not-found');

    if (!dbUser.config) throw redirect(302, '/app/setup');

    const fullUser = toFullUser(dbUser);

    if (!can(fullUser, 'change-own-email-address')) throw error(403, 'forbidden');

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { changeEmailForm: form });
    }

    if (form.data.email.trim() === session.user.email) {
      return setError(form, '', 'new-email-cannot-be-the-same-as-the-current-email');
    }

    try {
      await auth.useKey('email', session.user.email, form.data.password);
      await auth.invalidateAllUserSessions(session.user.userId);
      await auth.createKey({
        providerId: 'email',
        providerUserId: form.data.email.trim(),
        userId: session.user.userId,
        password: form.data.password,
      });
      await auth.deleteKey('email', fullUser.email);
      await auth.updateUserAttributes(session.user.userId, { email: form.data.email.trim() });

      const newSession = await auth.createSession({ userId: session.user.userId, attributes: {} });

      locals.auth.setSession(newSession);
    } catch (e) {
      if (e instanceof LuciaError && e.message === 'AUTH_INVALID_PASSWORD') {
        return setError(form, '', 'invalid-current-password');
      }

      console.error('Unable to change email');
      console.error(e);

      return setError(form, '', 'unable-to-change-email');
    }

    return message(form, 'email-changed-successfully');
  },
  changeUserConfig: async event => {
    const { locals, request } = event;
    const session = await locals.auth.validate();

    if (!session) return fail(401);

    const form = await superValidate(request, changeUserConfigSchema);

    if (ENABLE_RATE_LIMIT && await profileUpdateLimiter.isLimited(event)) {
      return setError(
        form,
        '',
        'rate-limiter.too-fast-error',
      );
    }

    const dbUser = await fullUserQuery.execute({ id: session.user.userId });

    if (!dbUser || dbUser.deleted) throw error(404, 'auth.user-not-found');

    if (!dbUser.config) throw redirect(302, '/app/setup');

    const fullUser = toFullUser(dbUser);

    if (!can(fullUser, 'change-own-user-details')) throw error(403, 'forbidden');

    if (!form.valid) {
      console.error('Form invalid');
      console.error(form.errors);
      return fail(400, { changeNameForm: form });
    }

    console.log('Changing user details...');

    try {
      await db.update(userConfig).set({
        displayname: form.data.displayname.trim(),
        firstname: form.data.firstname.trim(),
        lastname: (form.data.lastname ?? '').trim(),
        mobile: (form.data.mobile ?? '').trim(),
      }).where(eq(userConfig.userId, session.user.userId));
    } catch (e) {
      console.error('Unable to change details');
      console.error(e);

      return setError(form, '', 'unable-to-save-user-details');
    }

    return message(form, 'user-details-changed-successfully');
  },
};

export const load: PageServerLoad = async event => {
  profileUpdateLimiter.cookieLimiter?.preflight(event);

  const { locals } = event;
  const session = await locals.auth.validate();

  const dbUser = await fullUserQuery.execute({ id: session.user.userId });

  if (!dbUser || dbUser.deleted) throw error(404, 'auth.user-not-found');

  if (!dbUser.config) throw redirect(302, '/app/setup');

  const fullUser = toFullUser(dbUser);

  const userPerms = {
    canChangeEmail: can(fullUser, 'change-own-email-address'),
    canChangePassword: can(fullUser, 'change-own-password'),
    canChangeDetails: can(fullUser, 'change-own-user-details'),
    canDeleteAccount: can(fullUser, 'delete-own-account'),
  };

  const changePasswordForm = await superValidate(changePasswordSchema);
  const changeEmailForm = await superValidate(changeEmailSchema);
  const changeUserConfigForm = await superValidate(changeUserConfigSchema);
  const deleteAccountForm = await superValidate(deleteAccountSchema);

  changeUserConfigForm.data.displayname = dbUser.config.displayname;
  changeUserConfigForm.data.firstname = dbUser.config.firstname;
  changeUserConfigForm.data.lastname = dbUser.config.lastname;
  changeUserConfigForm.data.mobile = dbUser.config.mobile;

  return {
    user: toFullUser(dbUser),
    changePasswordForm,
    changeEmailForm,
    deleteAccountForm,
    changeUserConfigForm,
    userPerms,
  };
};
