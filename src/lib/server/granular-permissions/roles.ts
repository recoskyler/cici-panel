import { GRANULAR_PERMISSIONS_PREFIX } from '$lib/constants';
import { usersToRoles } from '$lib/db/schema';
import type { FullUser } from '$lib/db/types';
import { error } from '@sveltejs/kit';
import {
  and, eq, inArray,
} from 'drizzle-orm';
import { db } from '../drizzle';
import { currentUserFullQuery, currentUserMinQuery } from '../queries';
import { transformUser } from './transform';

// Check roles

export const hasDirectRole = (user: FullUser, role: string) => {
  return user.directRoles.some(
    r => r.name === `${GRANULAR_PERMISSIONS_PREFIX}.${role}`,
  );
};

export const hasRole = (user: FullUser, role: string) => {
  return user.allRoles.some(
    r => r.name === `${GRANULAR_PERMISSIONS_PREFIX}.${role}`,
  );
};

export const hasAllDirectRoles = (user: FullUser, roles: string[]) => {
  if (roles.length === 0) return false;

  return roles.every(
    r => user.directRoles.some(e => e.name === `${GRANULAR_PERMISSIONS_PREFIX}.${r}`),
  );
};

export const hasAllRoles = (user: FullUser, roles: string[]) => {
  if (roles.length === 0) return false;

  return roles.every(
    r => user.allRoles.some(e => e.name === `${GRANULAR_PERMISSIONS_PREFIX}.${r}`),
  );
};

export const hasAnyDirectRoles = (user: FullUser, roles: string[]) => {
  if (roles.length === 0) return false;

  return roles.some(
    r => user.directRoles.some(e => e.name === `${GRANULAR_PERMISSIONS_PREFIX}.${r}`),
  );
};

export const hasAnyRoles = (user: FullUser, roles: string[]) => {
  if (roles.length === 0) return false;

  return roles.some(
    r => user.allRoles.some(e => e.name === `${GRANULAR_PERMISSIONS_PREFIX}.${r}`),
  );
};

// Assign roles

export const assignRolesToUser = async (
  userId: string,
  roles: string[],
) => {
  const dbUser = await currentUserFullQuery.execute({ id: userId });

  if (!dbUser) throw error(404, 'auth.user-not-found');

  const user = transformUser(dbUser);

  if (roles.length === 0) return;
  if (hasAllRoles(user, roles)) return;

  const missingRoles = roles.filter(e => !user.directRoles.some(p => p.name === e));

  const dbRoles = await db.query.role.findMany({
    where: (role => inArray(
      role.name,
      missingRoles.map(e => `${GRANULAR_PERMISSIONS_PREFIX}.${e}`))
    ),
  });

  await db.insert(usersToRoles)
    .values(dbRoles.map(e => ({ roleId: e.id, userId: userId }))).onConflictDoNothing();
};

// Sync Roles

export const syncRolesToUser = async (
  userId: string,
  roles: string[],
) => {
  const dbUser = await currentUserMinQuery.execute({ id: userId });

  if (!dbUser) throw error(404, 'auth.user-not-found');

  const dbRoles = await db.query.role.findMany({
    where: (role => inArray(
      role.name,
      roles.map(e => `${GRANULAR_PERMISSIONS_PREFIX}.${e}`))
    ),
  });

  await db.delete(usersToRoles).where(eq(usersToRoles.userId, userId));

  if (roles.length === 0) return;

  await db.insert(usersToRoles)
    .values(dbRoles.map(e => ({ roleId: e.id, userId: userId }))).onConflictDoNothing();
};

// Remove Roles

export const removeRolesFromUser = async (
  userId: string,
  roles: string[],
) => {
  const dbUser = await currentUserMinQuery.execute({ id: userId });

  if (!dbUser) throw error(404, 'auth.user-not-found');

  if (roles.length === 0) return;

  const dbRoles = await db.query.role.findMany({
    where: (role => inArray(
      role.name,
      roles.map(e => `${GRANULAR_PERMISSIONS_PREFIX}.${e}`))
    ),
  });

  await db.delete(usersToRoles).where(and(
    eq(usersToRoles.userId, userId),
    inArray(usersToRoles.roleId, dbRoles.map(e => e.id)),
  ));
};

// Clear roles

export const clearUserRoles = (userId: string) => syncRolesToUser(userId, []);
