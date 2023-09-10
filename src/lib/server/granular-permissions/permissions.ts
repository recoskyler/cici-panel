import { GRANULAR_PERMISSIONS_PREFIX, PERMISSIONS } from '$lib/constants';
import type { FullUser } from '$lib/db/types';
import { error } from '@sveltejs/kit';
import { currentUserFullQuery, currentUserMinQuery } from '../queries';
import { transformUser } from './transform';
import { db } from '../drizzle';
import { usersToPermissions } from '$lib/db/schema';
import {
  and, eq, inArray,
} from 'drizzle-orm';

export type GranularPermission = typeof PERMISSIONS[
  Exclude<keyof typeof PERMISSIONS, keyof Array<typeof PERMISSIONS>>
];

// Check permissions

export const can = (user: FullUser, permissions: GranularPermission[]) => {
  if (permissions.length === 0) return false;

  return permissions.every(
    p => user.allPermissions.some(e => e.name === `${GRANULAR_PERMISSIONS_PREFIX}.${p}`),
  );
};

export const hasAllPermissions = (user: FullUser, permissions: GranularPermission[]) =>
  can(user, permissions);

export const hasAllDirectPermissions = (user: FullUser, permissions: GranularPermission[]) => {
  if (permissions.length === 0) return false;

  return permissions.every(
    p => user.directPermissions.some(e => e.name === `${GRANULAR_PERMISSIONS_PREFIX}.${p}`),
  );
};

export const hasAnyPermissions = (user: FullUser, permissions: GranularPermission[]) => {
  if (permissions.length === 0) return false;

  return permissions.some(
    p => user.allPermissions.some(e => e.name === `${GRANULAR_PERMISSIONS_PREFIX}.${p}`),
  );
};

export const hasAnyDirectPermissions = (user: FullUser, permissions: GranularPermission[]) => {
  if (permissions.length === 0) return false;

  return permissions.some(
    p => user.directPermissions.some(e => e.name === `${GRANULAR_PERMISSIONS_PREFIX}.${p}`),
  );
};

export const hasDirectPermission = (user: FullUser, permission: GranularPermission) => {
  return user.directPermissions.some(
    p => p.name === `${GRANULAR_PERMISSIONS_PREFIX}.${permission}`,
  );
};

export const hasPermission = (user: FullUser, permission: GranularPermission) => {
  return user.allPermissions.some(
    p => p.name === `${GRANULAR_PERMISSIONS_PREFIX}.${permission}`,
  );
};

// Assign Permissions

export const assignPermissionsToUser = async (
  userId: string,
  permissions: GranularPermission[],
) => {
  const dbUser = await currentUserFullQuery.execute({ id: userId });

  if (!dbUser) throw error(404, 'auth.user-not-found');

  const user = transformUser(dbUser);

  if (permissions.length === 0) return;
  if (can(user, permissions)) return;

  const missingPermissions = permissions
    .filter(e => !user.directPermissions.some(p => p.name === e));

  const dbPerms = await db.query.permission.findMany({
    where: (permission => inArray(
      permission.name,
      missingPermissions.map(e => `${GRANULAR_PERMISSIONS_PREFIX}.${e}`))
    ),
  });

  await db.insert(usersToPermissions)
    .values(dbPerms.map(e => ({ permissionId: e.id, userId: userId }))).onConflictDoNothing();
};

// Sync permissions

export const syncPermissionsToUser = async (
  userId: string,
  permissions: string[],
) => {
  const dbUser = await currentUserMinQuery.execute({ id: userId });

  if (!dbUser) throw error(404, 'auth.user-not-found');

  if (permissions.length === 0) return;

  const dbPermissions = await db.query.permission.findMany({
    where: (permission => inArray(
      permission.name,
      permissions.map(e => `${GRANULAR_PERMISSIONS_PREFIX}.${e}`))
    ),
  });

  await db.delete(usersToPermissions).where(eq(usersToPermissions.userId, userId));

  await db.insert(usersToPermissions)
    .values(dbPermissions.map(e => ({ permissionId: e.id, userId: userId }))).onConflictDoNothing();
};

// Remove permissions

export const removePermissionsFromUser = async (
  userId: string,
  permissions: string[],
) => {
  const dbUser = await currentUserMinQuery.execute({ id: userId });

  if (!dbUser) throw error(404, 'auth.user-not-found');

  if (permissions.length === 0) return;

  const dbPermissions = await db.query.permission.findMany({
    where: (permission => inArray(
      permission.name,
      permissions.map(e => `${GRANULAR_PERMISSIONS_PREFIX}.${e}`))
    ),
  });

  await db.delete(usersToPermissions).where(and(
    eq(usersToPermissions.userId, userId),
    inArray(usersToPermissions.permissionId, dbPermissions.map(e => e.id)),
  ));
};

// Clear roles

export const clearUserPermissions = (userId: string) => syncPermissionsToUser(userId, []);
