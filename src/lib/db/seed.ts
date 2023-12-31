import { db } from '../server/drizzle';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from '../db/schema';
import type { NewPermission, NewRole } from './types';
import { eq } from 'drizzle-orm';
import { GRANULAR_PERMISSIONS_PREFIX } from '$lib/constants';
import {
  PERMISSIONS, MODERATOR_PERMISSIONS, USER_PERMISSIONS,
} from '$lib/server/constants';
import { syncPermissionsToRole } from '$lib/server/granular-permissions/permissions';

// Permission name must be an I18N key

const permissions: NewPermission[] = PERMISSIONS.map(
  p => ({ name: `${GRANULAR_PERMISSIONS_PREFIX}.${p}` }),
);

const roles: NewRole[] = [
  {
    name: 'Administrator',
    description: 'Is a god.',
    protected: true,
  },
  {
    name: 'Moderator',
    description: 'Can manage users, groups and their roles and permissions, but cannot create roles or manage their permissions.',
    protected: true,
  },
  {
    name: 'User',
    description: 'A regular user. Can manage their own account.',
    protected: true,
  },
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
      { where: eq(schema.role.name, 'Administrator') },
    );

    if (adminRole) {
      syncPermissionsToRole(adminRole.id, PERMISSIONS.slice());

      console.log('Seeded admin role permissions');
    }

    const moderatorRole = await db.query.role.findFirst(
      { where: eq(schema.role.name, 'Moderator') },
    );

    if (moderatorRole) {
      syncPermissionsToRole(
        moderatorRole.id,
        MODERATOR_PERMISSIONS.concat(USER_PERMISSIONS),
      );

      console.log('Seeded moderator role permissions');
    }

    const userRole = await db.query.role.findFirst(
      { where: eq(schema.role.name, 'User') },
    );

    if (userRole) {
      syncPermissionsToRole(userRole.id, USER_PERMISSIONS);

      console.log('Seeded user role permissions');
    }

    console.log('Seeding complete');
  } catch (error) {
    console.error('Failed to seed');
    console.error(error);
  }
};
