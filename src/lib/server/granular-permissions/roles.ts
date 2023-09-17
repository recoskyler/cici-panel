import { groupsToRoles, usersToRoles } from '$lib/db/schema';
import type { FullUser } from '$lib/db/types';
import { error } from '@sveltejs/kit';
import {
  and, eq, inArray,
} from 'drizzle-orm';
import { db } from '../drizzle';
import { fullUserQuery } from '../queries';
import { toFullUser } from './transform';
import { ENABLE_GRANULAR_PERMISSIONS } from '$lib/constants';

// Check roles

export const hasDirectRole = (user: FullUser, role: string) => {
  if (!ENABLE_GRANULAR_PERMISSIONS) return true;
  return user.directRoles.some(
    r => r.name === role,
  );
};

export const hasRole = (user: FullUser, role: string) => {
  if (!ENABLE_GRANULAR_PERMISSIONS) return true;
  return user.allRoles.some(
    r => r.name === role,
  );
};

export const hasAllDirectRoles = (user: FullUser, roles: string[]) => {
  if (!ENABLE_GRANULAR_PERMISSIONS) return true;
  if (roles.length === 0) return false;

  return roles.every(
    r => user.directRoles.some(e => e.name === r),
  );
};

export const hasAllRoles = (user: FullUser, roles: string[]) => {
  if (!ENABLE_GRANULAR_PERMISSIONS) return true;
  if (roles.length === 0) return false;

  return roles.every(
    r => user.allRoles.some(e => e.name === r),
  );
};

export const hasAnyDirectRoles = (user: FullUser, roles: string[]) => {
  if (!ENABLE_GRANULAR_PERMISSIONS) return true;
  if (roles.length === 0) return false;

  return roles.some(
    r => user.directRoles.some(e => e.name === r),
  );
};

export const hasAnyRoles = (user: FullUser, roles: string[]) => {
  if (!ENABLE_GRANULAR_PERMISSIONS) return true;
  if (roles.length === 0) return false;

  return roles.some(
    r => user.allRoles.some(e => e.name === r),
  );
};

// Assign roles

export const assignRolesToUser = async (
  userId: string,
  roles: string[],
) => {
  const dbUser = await fullUserQuery.execute({ id: userId });

  if (!dbUser) throw error(404, 'auth.user-not-found');

  const user = toFullUser(dbUser);

  if (roles.length === 0) return;
  if (hasAllRoles(user, roles)) return;

  const missingRoles = roles.filter(e => !user.directRoles.some(p => p.name === e));

  const dbRoles = await db.query.role
    .findMany({ where: (role => inArray(role.name, missingRoles)) });

  await db.insert(usersToRoles)
    .values(dbRoles.map(e => ({ roleId: e.id, userId: userId }))).onConflictDoNothing();
};

// Sync Roles

export const syncRolesToUser = async (
  userId: string,
  roles: string[],
) => {
  const dbRoles = await db.query.role
    .findMany({ where: (role => inArray(role.name, roles)) });

  await db.delete(usersToRoles).where(eq(usersToRoles.userId, userId));

  if (roles.length === 0) return;

  await db.insert(usersToRoles)
    .values(dbRoles.map(e => ({ roleId: e.id, userId: userId }))).onConflictDoNothing();
};

export const syncRolesByIdToUser = async (
  userId: string,
  roleIds: string[],
) => {
  await db.delete(usersToRoles).where(eq(usersToRoles.userId, userId));

  if (roleIds.length === 0) return;

  await db.insert(usersToRoles)
    .values(roleIds.map(e => ({ roleId: e, userId: userId }))).onConflictDoNothing();
};

export const syncRolesByIdToGroup = async (
  groupId: string,
  roleIds: string[],
) => {
  await db.delete(groupsToRoles).where(eq(groupsToRoles.groupId, groupId));

  if (roleIds.length === 0) return;

  await db.insert(groupsToRoles)
    .values(roleIds.map(e => ({ roleId: e, groupId: groupId }))).onConflictDoNothing();
};

export const syncGroupsToRole = async (
  groupIds: string[],
  roleId: string,
) => {
  await db.delete(groupsToRoles).where(eq(groupsToRoles.roleId, roleId));

  if (groupIds.length === 0) return;

  await db.insert(groupsToRoles)
    .values(groupIds.map(e => ({ roleId: roleId, groupId: e }))).onConflictDoNothing();
};

export const syncUsersToRole = async (
  userIds: string[],
  roleId: string,
) => {
  await db.delete(usersToRoles).where(eq(usersToRoles.roleId, roleId));

  if (userIds.length === 0) return;

  await db.insert(usersToRoles)
    .values(userIds.map(e => ({ roleId: roleId, userId: e }))).onConflictDoNothing();
};

// Remove Roles

export const removeRolesFromUser = async (
  userId: string,
  roles: string[],
) => {
  if (roles.length === 0) return;

  const dbRoles = await db.query.role
    .findMany({ where: (role => inArray(role.name, roles)) });

  await db.delete(usersToRoles).where(and(
    eq(usersToRoles.userId, userId),
    inArray(usersToRoles.roleId, dbRoles.map(e => e.id)),
  ));
};

// Clear roles

export const clearUserRoles = async (userId: string) => await syncRolesToUser(userId, []);
