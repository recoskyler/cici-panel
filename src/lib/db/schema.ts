import {
  pgTable, bigint, varchar, boolean, text, uuid, primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const user = pgTable('auth_user', {
  id: varchar('id', { length: 15 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  verified: boolean('verified').default(false).notNull(),
});

export const session = pgTable('user_session', {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: varchar('user_id', { length: 15 })
    .notNull()
    .references(() => user.id),
  activeExpires: bigint('active_expires', { mode: 'number' }).notNull(),
  idleExpires: bigint('idle_expires', { mode: 'number' }).notNull(),
});

export const key = pgTable('user_key', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 15 })
    .notNull()
    .references(() => user.id),
  hashedPassword: varchar('hashed_password', { length: 255 }),
});

export const token = pgTable('auth_token', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  expires: bigint('expires', { mode: 'number' }).notNull(),
});

export const userConfig = pgTable('user_config', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id),
  displayname: varchar('displayname', { length: 20 }).notNull(),
  firstname: varchar('firstname', { length: 255 }).notNull(),
  lastname: varchar('lastname', { length: 255 }),
  mobile: varchar('mobile', { length: 32 }),
});

// Granular permissions

export const group = pgTable('group', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 32 }).notNull(),
  description: text('description'),
});

export const permission = pgTable('permission', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  description: text('description'),
});

export const role = pgTable('role', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  description: text('description'),
});

// Intermediate tables

export const permissionsToRoles = pgTable(
  'permissions_to_roles',
  {
    permissionId: uuid('permission_id').notNull().references(() => permission.id),
    roleId: uuid('role_id').notNull().references(() => role.id),
  },
  t => ({ pk: primaryKey(t.permissionId, t.roleId) }),
);

export const usersToRoles = pgTable(
  'users_to_roles',
  {
    userId: varchar('user_id', { length: 15 }).notNull().references(() => user.id),
    roleId: uuid('role_id').notNull().references(() => role.id),
  },
  t => ({ pk: primaryKey(t.userId, t.roleId) }),
);

export const usersToPermissions = pgTable(
  'users_to_permissions',
  {
    userId: varchar('user_id', { length: 15 }).notNull().references(() => user.id),
    permissionId: uuid('permission_id').notNull().references(() => permission.id),
  },
  t => ({ pk: primaryKey(t.permissionId, t.userId) }),
);

export const usersToGroups = pgTable(
  'users_to_groups',
  {
    userId: varchar('user_id', { length: 15 }).notNull().references(() => user.id),
    groupId: uuid('group_id').notNull().references(() => group.id),
  },
  t => ({ pk: primaryKey(t.userId, t.groupId) }),
);

export const groupsToRoles = pgTable(
  'groups_to_roles',
  {
    groupId: uuid('group_id').notNull().references(() => group.id),
    roleId: uuid('role_id').notNull().references(() => role.id),
  },
  t => ({ pk: primaryKey(t.groupId, t.roleId) }),
);

export const groupsToPermissions = pgTable(
  'groups_to_permissions',
  {
    groupId: uuid('group_id').notNull().references(() => group.id),
    permissionId: uuid('permission_id').notNull().references(() => permission.id),
  },
  t => ({ pk: primaryKey(t.permissionId, t.groupId) }),
);

// Relations

export const userRelations = relations(user, ({ one, many }) => ({
  config: one(userConfig, {
    fields: [user.id],
    references: [userConfig.userId],
  }),
  usersToPermissions: many(usersToPermissions),
  usersToRoles: many(usersToRoles),
  usersToGroups: many(usersToGroups),
}));

export const roleRelations = relations(role, ({ many }) => ({
  permissionsToRoles: many(permissionsToRoles),
  usersToRoles: many(usersToRoles),
}));

export const permissionRelations = relations(permission, ({ many }) => ({
  permissionsToRoles: many(permissionsToRoles),
  usersToPermissions: many(usersToPermissions),
}));

export const groupsRelations = relations(group, ({ many }) => ({
  usersToGroups: many(usersToGroups),
  groupsToPermissions: many(groupsToPermissions),
  groupsToRoles: many(groupsToRoles),
}));

export const permissionsToRolesRelations = relations(permissionsToRoles, ({ one }) => ({
  role: one(role, {
    fields: [permissionsToRoles.roleId],
    references: [role.id],
  }),
  permission: one(permission, {
    fields: [permissionsToRoles.permissionId],
    references: [permission.id],
  }),
}));

export const usersToPermissionsRelations = relations(usersToPermissions, ({ one }) => ({
  user: one(user, {
    fields: [usersToPermissions.userId],
    references: [user.id],
  }),
  permission: one(permission, {
    fields: [usersToPermissions.permissionId],
    references: [permission.id],
  }),
}));

export const usersToRolesRelations = relations(usersToRoles, ({ one }) => ({
  role: one(role, {
    fields: [usersToRoles.roleId],
    references: [role.id],
  }),
  user: one(user, {
    fields: [usersToRoles.userId],
    references: [user.id],
  }),
}));

export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
  group: one(group, {
    fields: [usersToGroups.groupId],
    references: [group.id],
  }),
  user: one(user, {
    fields: [usersToGroups.userId],
    references: [user.id],
  }),
}));

export const groupsToPermissionsRelations = relations(groupsToPermissions, ({ one }) => ({
  group: one(group, {
    fields: [groupsToPermissions.groupId],
    references: [group.id],
  }),
  permission: one(permission, {
    fields: [groupsToPermissions.permissionId],
    references: [permission.id],
  }),
}));

export const groupsToRolesRelations = relations(groupsToRoles, ({ one }) => ({
  role: one(role, {
    fields: [groupsToRoles.roleId],
    references: [role.id],
  }),
  group: one(group, {
    fields: [groupsToRoles.groupId],
    references: [group.id],
  }),
}));
