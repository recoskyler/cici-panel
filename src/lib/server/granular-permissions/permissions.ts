import { ENABLE_GRANULAR_PERMISSIONS, GRANULAR_PERMISSIONS_PREFIX } from '$lib/constants';
import type { FullUser } from '$lib/db/types';
import { error } from '@sveltejs/kit';
import { fullUserQuery } from '../queries';
import { toFullUser } from './transform';
import { db } from '../drizzle';
import {
  groupsToPermissions, permissionsToRoles, usersToPermissions,
} from '$lib/db/schema';
import {
  and, eq, inArray,
} from 'drizzle-orm';
import type { PERMISSIONS } from '../constants';

export type GranularPermission = typeof PERMISSIONS[
  Exclude<keyof typeof PERMISSIONS, keyof Array<typeof PERMISSIONS>>
];

// Check permissions

export const hasAllDirectPermissions = (user: FullUser, permissions: GranularPermission[]) => {
  if (!ENABLE_GRANULAR_PERMISSIONS) return true;
  if (permissions.length === 0) return false;

  return permissions.every(
    p => user.directPermissions.some(e => e.name === `${GRANULAR_PERMISSIONS_PREFIX}.${p}`),
  );
};

export const hasAnyPermissions = (user: FullUser, permissions: GranularPermission[]) => {
  if (!ENABLE_GRANULAR_PERMISSIONS) return true;
  if (permissions.length === 0) return false;

  return permissions.some(
    p => user.allPermissions.some(e => e.name === `${GRANULAR_PERMISSIONS_PREFIX}.${p}`),
  );
};

export const hasAnyDirectPermissions = (user: FullUser, permissions: GranularPermission[]) => {
  if (!ENABLE_GRANULAR_PERMISSIONS) return true;
  if (permissions.length === 0) return false;

  return permissions.some(
    p => user.directPermissions.some(e => e.name === `${GRANULAR_PERMISSIONS_PREFIX}.${p}`),
  );
};

export const hasDirectPermission = (user: FullUser, permission: GranularPermission) => {
  if (!ENABLE_GRANULAR_PERMISSIONS) return true;
  return user.directPermissions.some(
    p => p.name === `${GRANULAR_PERMISSIONS_PREFIX}.${permission}`,
  );
};

export const hasPermission = (user: FullUser, permission: GranularPermission) => {
  if (!ENABLE_GRANULAR_PERMISSIONS) return true;
  return user.allPermissions.some(
    p => p.name === `${GRANULAR_PERMISSIONS_PREFIX}.${permission}`,
  );
};

export const can = (user: FullUser, permissions: GranularPermission | GranularPermission[]) => {
  if (!ENABLE_GRANULAR_PERMISSIONS) return true;
  if (!Array.isArray(permissions)) return hasPermission(user, permissions);

  if (permissions.length === 0) return false;

  return permissions.every(
    p => user.allPermissions.some(e => e.name === `${GRANULAR_PERMISSIONS_PREFIX}.${p}`),
  );
};

export const hasAllPermissions = (user: FullUser, permissions: GranularPermission[]) =>
  can(user, permissions);

// Assign Permissions

export const assignPermissionsToUser = async (
  userId: string,
  permissions: GranularPermission[],
) => {
  const dbUser = await fullUserQuery.execute({ id: userId });

  if (!dbUser) throw error(404, 'auth.user-not-found');

  const user = toFullUser(dbUser);

  if (permissions.length === 0) return;
  if (can(user, permissions)) return;

  await db.insert(usersToPermissions)
    .values(permissions.map(
      e => ({ permissionName: `${GRANULAR_PERMISSIONS_PREFIX}.${e}`, userId: userId }),
    ))
    .onConflictDoNothing();
};

export const assignPermissionsToRole = async (
  roleId: string,
  permissions: GranularPermission[],
) => {
  if (permissions.length === 0) return;

  await db.insert(permissionsToRoles)
    .values(permissions.map(
      e => ({ permissionName: `${GRANULAR_PERMISSIONS_PREFIX}.${e}`, roleId: roleId }),
    ))
    .onConflictDoNothing();
};

// Sync permissions

export const syncPermissionsToUser = async (
  userId: string,
  permissions: string[],
) => {
  await db.delete(usersToPermissions).where(eq(usersToPermissions.userId, userId));

  if (permissions.length === 0) return;

  await db.insert(usersToPermissions)
    .values(permissions.map(
      e => ({ permissionName: `${GRANULAR_PERMISSIONS_PREFIX}.${e}`, userId: userId }),
    ))
    .onConflictDoNothing();
};

export const syncPermissionsToRole = async (
  roleId: string,
  permissions: string[],
) => {
  await db.delete(permissionsToRoles).where(eq(permissionsToRoles.roleId, roleId));

  if (permissions.length === 0) return;

  await db.insert(permissionsToRoles)
    .values(permissions.map(
      e => ({ permissionName: `${GRANULAR_PERMISSIONS_PREFIX}.${e}`, roleId: roleId }),
    ))
    .onConflictDoNothing();
};

export const syncPermissionsToGroup = async (
  groupId: string,
  permissions: string[],
) => {
  await db.delete(groupsToPermissions).where(eq(groupsToPermissions.groupId, groupId));

  if (permissions.length === 0) return;

  await db.insert(groupsToPermissions)
    .values(permissions.map(
      e => ({ permissionName: `${GRANULAR_PERMISSIONS_PREFIX}.${e}`, groupId: groupId }),
    ))
    .onConflictDoNothing();
};

// Remove permissions

export const removePermissionsFromUser = async (
  userId: string,
  permissions: string[],
) => {
  if (permissions.length === 0) return;

  await db.delete(usersToPermissions).where(and(
    eq(usersToPermissions.userId, userId),
    inArray(
      usersToPermissions.permissionName,
      permissions.map(e => `${GRANULAR_PERMISSIONS_PREFIX}.${e}`),
    ),
  ));
};

// Clear permissions

export const clearUserPermissions = async (userId: string) =>
  await syncPermissionsToUser(userId, []);
