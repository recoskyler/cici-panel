import { db } from '../server/drizzle';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from '../db/schema';
import type { NewPermission, NewRole } from './types';
import { eq, inArray } from 'drizzle-orm';
import {
  GRANULAR_PERMISSIONS_PREFIX,
  MODERATOR_PERMISSIONS,
  PERMISSIONS,
  USER_PERMISSIONS,
} from '$lib/constants';

// Permission name must be an I18N key

const permissions: NewPermission[] = PERMISSIONS.map(
  p => ({ name: `${GRANULAR_PERMISSIONS_PREFIX}.${p}` }),
);

const roles: NewRole[] = [
  { name: `${GRANULAR_PERMISSIONS_PREFIX}.administrator` },
  { name: `${GRANULAR_PERMISSIONS_PREFIX}.moderator` },
  { name: `${GRANULAR_PERMISSIONS_PREFIX}.user` },
];

export const seed = async () => {
  console.log('Seeding database...');

  try {
    await migrate(db, { migrationsFolder: 'drizzle' });

    await db.insert(schema.permission).values(permissions).onConflictDoNothing();

    console.log('Seeded permissions');

    await db.insert(schema.role).values(roles).onConflictDoNothing();

    console.log('Seeded empty roles');

    const adminRole = await db.query.role.findFirst(
      { where: eq(schema.role.name, 'granular-perms.administrator') },
    );

    if (adminRole) {
      const dbAdminPerms = await db.query.permission.findMany();

      await db.insert(schema.permissionsToRoles).values(
        dbAdminPerms.map(e => ({ permissionId: e.id, roleId: adminRole.id })),
      );

      console.log('Seeded admin role permissions');
    }

    const moderatorRole = await db.query.role.findFirst(
      { where: eq(schema.role.name, 'granular-perms.moderator') },
    );

    if (moderatorRole) {
      const dbModeratorPerms = await db.query.permission.findMany(
        { where: inArray(schema.permission.name, MODERATOR_PERMISSIONS.concat(USER_PERMISSIONS)) },
      );

      await db.insert(schema.permissionsToRoles).values(
        dbModeratorPerms.map(e => ({ permissionId: e.id, roleId: moderatorRole.id })),
      );

      console.log('Seeded moderator role permissions');
    }

    const userRole = await db.query.role.findFirst(
      { where: eq(schema.role.name, 'granular-perms.user') },
    );

    if (userRole) {
      const dbUserPerms = await db.query.permission.findMany(
        { where: inArray(schema.permission.name, USER_PERMISSIONS) },
      );

      await db.insert(schema.permissionsToRoles).values(
        dbUserPerms.map(e => ({ permissionId: e.id, roleId: userRole.id })),
      );

      console.log('Seeded user role permissions');
    }

    console.log('Seeding complete');
  } catch (error) {
    console.error('Failed to seed');
    console.error(error);
  }
};
