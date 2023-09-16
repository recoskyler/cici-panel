import type { GranularPermission } from './granular-permissions/permissions';

export const PERMISSIONS = [
  'change-own-password',
  'change-own-email-address',
  'change-own-user-details',
  'delete-own-account',
  'create-new-user',
  'update-other-user',
  'read-list-other-users',
  'delete-other-user',
  'create-user-group',
  'update-user-group-details',
  'read-list-user-groups',
  'delete-user-group',
  'change-user-permissions',
  'change-role-permissions',
  'change-user-group-permissions',
  'change-user-roles',
  'change-user-group-roles',
  'add-remove-user-group-members',
  'create-role',
  'delete-role',
  'update-role-details',
  'read-list-roles',
  'read-list-permissions',
] as const;

export const MODERATOR_PERMISSIONS: GranularPermission[] = [
  'create-new-user',
  'update-other-user',
  'read-list-other-users',
  'delete-other-user',
  'create-user-group',
  'update-user-group-details',
  'read-list-user-groups',
  'delete-user-group',
  'change-user-permissions',
  'change-user-group-permissions',
  'change-user-roles',
  'change-user-group-roles',
  'add-remove-user-group-members',
  'read-list-roles',
  'read-list-permissions',
];

export const USER_PERMISSIONS: GranularPermission[] = [
  'change-own-password',
  'change-own-email-address',
  'change-own-user-details',
  'delete-own-account',
];
