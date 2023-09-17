import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import {
  user,
  token,
  userConfig,
  group,
  permission,
  role,
  usersToGroups,
  usersToPermissions,
  usersToRoles,
  permissionsToRoles,
  groupsToRoles,
  groupsToPermissions,
} from './schema';
import {
  MAX_DISPLAY_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_FIRST_NAME_LENGTH,
  MAX_LAST_NAME_LENGTH,
  MAX_MOBILE_LENGTH,
  MIN_DISPLAY_NAME_LENGTH,
  MIN_EMAIL_LENGTH,
  MIN_FIRST_NAME_LENGTH,
  MIN_LAST_NAME_LENGTH,
  MIN_MOBILE_LENGTH,
} from '$lib/constants';
import isMobilePhone from 'validator/lib/isMobilePhone';

// Zod Schemas

export const insertUserSchema = createInsertSchema(
  user,
  { email: z.string().email().min(MIN_EMAIL_LENGTH).max(MAX_EMAIL_LENGTH) },
);

export const selectUserSchema = createSelectSchema(user);

export const insertTokenSchema = createInsertSchema(token);

export const selectTokenSchema = createSelectSchema(token);

export const innerInsertUserConfigSchema = {
  displayname: z.string().min(MIN_DISPLAY_NAME_LENGTH).max(MAX_DISPLAY_NAME_LENGTH),
  firstname: z.string().min(MIN_FIRST_NAME_LENGTH).max(MAX_FIRST_NAME_LENGTH),
  lastname: z.string().min(MIN_LAST_NAME_LENGTH).max(MAX_LAST_NAME_LENGTH).nullable().optional(),
  mobile: z.string()
    .min(MIN_MOBILE_LENGTH)
    .max(MAX_MOBILE_LENGTH)
    .refine(isMobilePhone)
    .nullable()
    .optional(),
};

export const insertUserConfigSchema = createInsertSchema(userConfig, innerInsertUserConfigSchema);

export const selectUserConfigSchema = createSelectSchema(userConfig);

export const selectGroupSchema = createSelectSchema(group);
export const insertGroupSchema = createInsertSchema(group);

export const selectRoleSchema = createSelectSchema(role);
export const insertRoleSchema = createInsertSchema(role);

export const selectPermissionSchema = createSelectSchema(permission);
export const insertPermissionSchema = createInsertSchema(permission);

export const selectUsersToGroupsSchema = createSelectSchema(usersToGroups);
export const insertUsersToGroupsSchema = createInsertSchema(usersToGroups);

export const selectUsersToPermissionsSchema = createSelectSchema(usersToPermissions);
export const insertUsersToPermissionsSchema = createInsertSchema(usersToPermissions);

export const selectUsersToRolesSchema = createSelectSchema(usersToRoles);
export const insertUsersToRolesSchema = createInsertSchema(usersToRoles);

export const selectPermissionsToRolesSchema = createSelectSchema(permissionsToRoles);
export const insertPermissionsToRolesSchema = createInsertSchema(permissionsToRoles);

export const selectGroupsToRolesSchema = createSelectSchema(groupsToRoles);
export const insertGroupsToRolesSchema = createInsertSchema(groupsToRoles);

export const selectGroupsToPermissionsSchema = createSelectSchema(groupsToPermissions);
export const insertGroupsToPermissionsSchema = createInsertSchema(groupsToPermissions);

export const FullDatabaseUserSchema = selectUserSchema.extend({
  config: selectUserConfigSchema,
  usersToRoles: z.array(
    selectUsersToRolesSchema.extend({
      role: selectRoleSchema.extend({
        permissionsToRoles: z.array(
          selectPermissionsToRolesSchema.extend({ permission: selectPermissionSchema }),
        ),
      }),
    }),
  ),
  usersToPermissions: z.array(
    selectUsersToPermissionsSchema.extend({ permission: selectPermissionSchema }),
  ),
  usersToGroups: z.array(
    selectUsersToGroupsSchema.extend({
      group: selectGroupSchema.extend({
        groupsToPermissions: z.array(
          selectGroupsToPermissionsSchema.extend({ permission: selectPermissionSchema }),
        ),
        groupsToRoles: z.array(
          selectGroupsToRolesSchema.extend({
            roleId: z.string().uuid(),
            groupId: z.string().uuid(),
            role: selectRoleSchema.extend({
              permissionsToRoles: z.array(
                selectPermissionsToRolesSchema.extend({ permission: selectPermissionSchema }),
              ),
            }),
          }),
        ),
      }),
    }),
  ),
});

export const SafeDatabaseUserSchema = selectUserSchema.extend({
  config: selectUserConfigSchema,
  usersToRoles: z.array(
    selectUsersToRolesSchema.extend({ role: selectRoleSchema }),
  ),
  usersToGroups: z.array(
    selectUsersToGroupsSchema.extend({
      group: selectGroupSchema.extend({
        groupsToRoles: z.array(
          selectGroupsToRolesSchema.extend({ role: selectRoleSchema }),
        ),
      }),
    }),
  ),
});

export const MinDatabaseUserSchema = selectUserSchema.extend({ config: selectUserConfigSchema });

export const FullRoleSchema = selectRoleSchema.extend({
  permissions: z.array(selectPermissionSchema),
  users: z.array(MinDatabaseUserSchema),
  groups: z.array(selectGroupSchema),
});

export const SafeRoleSchema = selectRoleSchema.extend({
  users: z.array(MinDatabaseUserSchema),
  groups: z.array(selectGroupSchema),
});

export const FullDatabaseRoleSchema = selectRoleSchema.extend({
  permissionsToRoles: z.array(
    selectPermissionsToRolesSchema.extend({ permission: selectPermissionSchema }),
  ),
  groupsToRoles: z.array(
    selectGroupsToRolesSchema.extend({ group: selectGroupSchema }),
  ),
  usersToRoles: z.array(
    selectUsersToRolesSchema.extend({ user: MinDatabaseUserSchema }),
  ),
});

export const SafeDatabaseRoleSchema = selectRoleSchema.extend({
  groupsToRoles: z.array(
    selectGroupsToRolesSchema.extend({ group: selectGroupSchema }),
  ),
  usersToRoles: z.array(
    selectUsersToRolesSchema.extend({ user: MinDatabaseUserSchema }),
  ),
});

export const FullDatabaseGroupSchema = selectGroupSchema.extend({
  groupsToPermissions: z.array(
    selectGroupsToPermissionsSchema.extend({ permission: selectPermissionSchema }),
  ),
  groupsToRoles: z.array(
    selectGroupsToRolesSchema.extend({
      role: selectRoleSchema.extend({
        permissionsToRoles: z.array(
          selectPermissionsToRolesSchema.extend({ permission: selectPermissionSchema }),
        ),
      }),
    }),
  ),
  usersToGroups: z.array(
    selectUsersToGroupsSchema.extend({ user: MinDatabaseUserSchema }),
  ),
});

export const SafeDatabaseGroupSchema = selectGroupSchema.extend({
  groupsToRoles: z.array(selectGroupsToRolesSchema.extend({ role: selectRoleSchema })),
  usersToGroups: z.array(
    selectUsersToGroupsSchema.extend({ user: MinDatabaseUserSchema }),
  ),
});

export const FullGroupSchema = selectGroupSchema.extend({
  roles: z.array(FullRoleSchema),
  permissions: z.array(selectPermissionSchema),
  users: z.array(MinDatabaseUserSchema),
});

export const SafeGroupSchema = selectGroupSchema.extend({
  roles: z.array(selectRoleSchema),
  users: z.array(MinDatabaseUserSchema),
});

export const FullUserSchema = selectUserSchema.extend({
  config: selectUserConfigSchema,
  directRoles: z.array(FullRoleSchema),
  directPermissions: z.array(selectPermissionSchema),
  groups: z.array(FullGroupSchema),
  allPermissions: z.array(selectPermissionSchema),
  allRoles: z.array(FullRoleSchema),
});

export const SafeUserSchema = selectUserSchema.extend({
  config: selectUserConfigSchema,
  directRoles: z.array(selectRoleSchema),
  groups: z.array(SafeGroupSchema),
  allRoles: z.array(selectRoleSchema),
});

// Types

export type NewUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;

export type NewToken = z.infer<typeof insertTokenSchema>;
export type Token = z.infer<typeof selectTokenSchema>;

export type NewUserConfig = z.infer<typeof insertUserConfigSchema>;
export type UserConfig = z.infer<typeof selectUserConfigSchema>;

export type NewGroup = z.infer<typeof insertGroupSchema>;
export type Group = z.infer<typeof selectGroupSchema>;

export type NewRole = z.infer<typeof insertRoleSchema>;
export type Role = z.infer<typeof selectRoleSchema>;

export type NewPermission = z.infer<typeof insertPermissionSchema>;
export type Permission = z.infer<typeof selectPermissionSchema>;

export type NewUsersToGroups = z.infer<typeof selectUsersToGroupsSchema>;
export type UsersToGroups = z.infer<typeof selectUsersToGroupsSchema>;

export type NewUsersToPermissions = z.infer<typeof insertUsersToPermissionsSchema>;
export type UsersToPermissions = z.infer<typeof selectUsersToPermissionsSchema>;

export type NewUsersToRoles = z.infer<typeof insertUsersToRolesSchema>;
export type UsersToRoles = z.infer<typeof selectUsersToRolesSchema>;

export type NewPermissionsToRoles = z.infer<typeof insertPermissionsToRolesSchema>;
export type PermissionsToRoles = z.infer<typeof selectPermissionsToRolesSchema>;

export type NewGroupsToRoles = z.infer<typeof insertGroupsToRolesSchema>;
export type GroupsToRoles = z.infer<typeof selectGroupsToRolesSchema>;

export type NewGroupsToPermissions = z.infer<typeof insertGroupsToPermissionsSchema>;
export type GroupsToPermissions = z.infer<typeof selectGroupsToPermissionsSchema>;

export type FullDatabaseRole = z.infer<typeof FullDatabaseRoleSchema>;
export type SafeDatabaseRole = z.infer<typeof SafeDatabaseRoleSchema>;

export type FullRole = z.infer<typeof FullRoleSchema>;
export type SafeRole = z.infer<typeof SafeRoleSchema>;

export type FullDatabaseUser = z.infer<typeof FullDatabaseUserSchema>;
export type SafeDatabaseUser = z.infer<typeof SafeDatabaseUserSchema>;
export type MinDatabaseUser = z.infer<typeof MinDatabaseUserSchema>;

export type MinUser = z.infer<typeof MinDatabaseUserSchema>;
export type SafeUser = z.infer<typeof SafeUserSchema>;
export type FullUser = z.infer<typeof FullUserSchema>;

export type SafeDatabaseGroup = z.infer<typeof SafeDatabaseGroupSchema>;
export type FullDatabaseGroup = z.infer<typeof FullDatabaseGroupSchema>;
export type SafeGroup = z.infer<typeof SafeGroupSchema>;
export type FullGroup = z.infer<typeof FullGroupSchema>;
