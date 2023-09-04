import { pgTable, uuid } from 'drizzle-orm/pg-core';

export const user = pgTable('auth_user', {
  id: uuid('uuid'),
  // other user attributes
});
