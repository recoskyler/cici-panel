/* eslint-disable max-len */
import { sql } from 'drizzle-orm';
import { db } from './drizzle';

export const currentUserFullQuery = db.query.user.findFirst({
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
}).prepare('current_user_full');

export const currentUserMinQuery = db.query.user.findFirst({
  where: ((user, { eq }) => eq(user.id, sql.placeholder('id'))),
  with: { config: true },
}).prepare('current_user_min');
