/* eslint-disable max-len */
import { ne, sql } from 'drizzle-orm';
import { db } from './drizzle';
import { user } from '$lib/db/schema';

// FULL - Includes permissions, roles, user details, and groups
// SAFE - Does not include permissions, but includes roles, user details, and groups
// MIN  - Includes only user details (user config)

// Find first

export const fullUserQuery = db.query.user.findFirst({
  where: ((user, { eq }) => eq(user.id, sql.placeholder('id'))),
  with: {
    usersToGroups: {
      with: {
        group: {
          with: {
            groupsToPermissions: { with: { permission: true } },
            groupsToRoles: { with: { role: { with: { permissionsToRoles: { with: { permission: true } } } } } },
          },
        },
      },
    },
    usersToPermissions: { with: { permission: true } },
    usersToRoles: { with: { role: { with: { permissionsToRoles: { with: { permission: true } } } } } },
    config: true,
  },
}).prepare('user_full');

export const safeUserQuery = db.query.user.findFirst({
  where: ((user, { eq }) => eq(user.id, sql.placeholder('id'))),
  with: {
    usersToGroups: { with: { group: { with: { groupsToRoles: { with: { role: true } } } } } },
    usersToRoles: { with: { role: true } },
    config: true,
  },
}).prepare('user_safe');

export const minUserQuery = db.query.user.findFirst({
  where: ((user, { eq }) => eq(user.id, sql.placeholder('id'))),
  with: { config: true },
}).prepare('user_min');

export const fullGroupQuery = db.query.group
  .findFirst({
    where: (group, { eq }) => eq(group.id, sql.placeholder('id')),
    with: {
      groupsToPermissions: { with: { permission: true } },
      groupsToRoles: { with: { role: { with: { permissionsToRoles: { with: { permission: true } } } } } },
      usersToGroups: { with: { user: { with: { config: true } } } },
    },
  })
  .prepare('group_full');

export const safeGroupQuery = db.query.group
  .findFirst({
    where: (group, { eq }) => eq(group.id, sql.placeholder('id')),
    with: {
      groupsToRoles: { with: { role: true } },
      usersToGroups: { with: { user: { with: { config: true } } } },
    },
  })
  .prepare('group_safe');

export const safeRoleQuery = db.query.role
  .findFirst({
    where: (role, { eq }) => eq(role.id, sql.placeholder('id')),
    with: {
      groupsToRoles: { with: { group: true } },
      usersToRoles: { with: { user: { with: { config: true } } } },
    },
  })
  .prepare('role_safe');

export const fullRoleQuery = db.query.role
  .findFirst({
    where: (role, { eq }) => eq(role.id, sql.placeholder('id')),
    with: {
      groupsToRoles: { with: { group: { with: { groupsToPermissions: { with: { permission: true } } } } } },
      usersToRoles: { with: { user: { with: { config: true } } } },
      permissionsToRoles: { with: { permission: true } },
    },
  })
  .prepare('role_full');

// Find many

export const fullOtherUsersQuery = await db.query.user.findMany({
  where: ne(user.id, sql.placeholder('currentUserId')),
  with: {
    usersToGroups: {
      with: {
        group: {
          with: {
            groupsToPermissions: { with: { permission: true } },
            groupsToRoles: { with: { role: { with: { permissionsToRoles: { with: { permission: true } } } } } },
          },
        },
      },
    },
    usersToPermissions: { with: { permission: true } },
    usersToRoles: { with: { role: { with: { permissionsToRoles: { with: { permission: true } } } } } },
    config: true,
  },
}).prepare('other_users_full');

export const safeOtherUsersQuery = await db.query.user.findMany({
  where: ne(user.id, sql.placeholder('currentUserId')),
  with: {
    usersToGroups: { with: { group: { with: { groupsToRoles: { with: { role: true } } } } } },
    usersToRoles: { with: { role: true } },
    config: true,
  },
}).prepare('other_users_safe');

export const minOtherUsersQuery = db.query.user.findMany({
  where: ne(user.id, sql.placeholder('currentUserId')),
  with: { config: true },
}).prepare('other_users_min');

export const availableGroupsQuery = db.query.group
  .findMany({ where: (group, { eq }) => eq(group.deleted, false) })
  .prepare('available_groups');

export const availableRolesQuery = db.query.role
  .findMany({ where: (role, { eq }) => eq(role.deleted, false) })
  .prepare('available_roles');

export const safeGroupsQuery = db.query.group
  .findMany({
    with: {
      groupsToRoles: { with: { role: true } },
      usersToGroups: { with: { user: { with: { config: true } } } },
    },
  })
  .prepare('groups_safe');

export const safeRolesQuery = db.query.role
  .findMany({
    with: {
      groupsToRoles: { with: { group: true } },
      usersToRoles: { with: { user: { with: { config: true } } } },
    },
  })
  .prepare('roles_safe');
