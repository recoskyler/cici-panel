import { usersToGroups } from '$lib/db/schema';
import type { FullUser } from '$lib/db/types';
import { error } from '@sveltejs/kit';
import {
  and, eq, inArray,
} from 'drizzle-orm';
import { db } from '../drizzle';
import { fullUserQuery } from '../queries';
import { toFullUser } from './transform';

// Check groups

export const inGroup = (user: FullUser, groupId: string) =>
  user.groups.some(g => g.id === groupId);

export const inAllGroups = (user: FullUser, groupIds: string[]) => {
  if (groupIds.length === 0) return false;

  return groupIds.every(r => user.groups.some(e => e.id === r));
};

export const inAnyGroup = (user: FullUser, groupIds: string[]) => {
  if (groupIds.length === 0) return false;

  return groupIds.some(r => user.groups.some(e => e.id === r));
};

// Add users to groups

export const addUserToGroups = async (
  userId: string,
  groupIds: string[],
) => {
  const dbUser = await fullUserQuery.execute({ id: userId });

  if (!dbUser) throw error(404, 'auth.user-not-found');

  const user = toFullUser(dbUser);

  if (groupIds.length === 0) return;
  if (inAllGroups(user, groupIds)) return;

  const missingGroups = groupIds.filter(e => !user.groups.some(p => p.id === e));

  const dbGroups = await db.query.group
    .findMany({ where: (group => inArray(group.id, missingGroups)) });

  await db.insert(usersToGroups)
    .values(dbGroups.map(e => ({ groupId: e.id, userId: userId }))).onConflictDoNothing();
};

export const addUserToGroup = async (
  userId: string,
  groupId: string,
) => {
  const dbUser = await fullUserQuery.execute({ id: userId });

  if (!dbUser) throw error(404, 'auth.user-not-found');

  const user = toFullUser(dbUser);

  if (groupId.length === 0) return;
  if (inGroup(user, groupId)) return;

  await db.insert(usersToGroups)
    .values({ groupId: groupId, userId: userId }).onConflictDoNothing();
};

export const addUsersToGroups = async (
  userIds: string[],
  groupIds: string[],
) => {
  await userIds.forEach(async u => await addUserToGroups(u, groupIds));
};

export const addUsersToGroup = async (
  userIds: string[],
  groupId: string,
) => {
  await userIds.forEach(async u => await addUserToGroup(u, groupId));
};

// Sync groups

export const syncUsersToGroup = async (
  userIds: string[],
  groupId: string,
) => {
  await db.delete(usersToGroups).where(eq(usersToGroups.groupId, groupId));

  if (userIds.length === 0) return;

  await db.insert(usersToGroups)
    .values(userIds.map(e => ({ userId: e, groupId: groupId }))).onConflictDoNothing();
};

export const syncGroupsToUser = async (
  groupIds: string[],
  userId: string,
) => {
  await db.delete(usersToGroups).where(eq(usersToGroups.userId, userId));

  if (groupIds.length === 0) return;

  await db.insert(usersToGroups)
    .values(groupIds.map(e => ({ groupId: e, userId: userId }))).onConflictDoNothing();
};

export const syncGroupsToUsers = async (
  groupIds: string[],
  userIds: string[],
) => {
  await userIds.forEach(async u => await syncGroupsToUser(groupIds, u));
};

// Remove groups

export const removeGroupsFromUser = async (
  groupIds: string[],
  userId: string,
) => {
  if (groupIds.length === 0) return;

  await db.delete(usersToGroups).where(and(
    eq(usersToGroups.userId, userId),
    inArray(usersToGroups.groupId, groupIds),
  ));
};

export const removeGroupsFromUsers = async (
  groupIds: string[],
  userIds: string[],
) => {
  await userIds.forEach(async u => await removeGroupsFromUser(groupIds, u));
};

// Clear groups

export const clearUserGroups = async (userId: string) =>
  await syncGroupsToUser([], userId);
