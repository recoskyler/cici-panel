import {
  pgTable, bigint, varchar, boolean, text, uuid,
} from 'drizzle-orm/pg-core';

export const user = pgTable('auth_user', {
  id: varchar('id', { length: 15 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  verified: boolean('verified').default(false).notNull(),
  displayName: varchar('display_name', { length: 20 }).notNull(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  mobile: varchar('mobile', { length: 32 }),
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
});
