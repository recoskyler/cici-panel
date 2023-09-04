import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import {
  user, token, userConfig,
} from './schema';
import {
  MAX_DISPLAY_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_FIRST_NAME_LENGTH,
  MAX_LAST_NAME_LENGTH,
  MIN_DISPLAY_NAME_LENGTH,
  MIN_EMAIL_LENGTH,
  MIN_FIRST_NAME_LENGTH,
  MIN_LAST_NAME_LENGTH,
} from '$lib/constants';

// Zod Schemas

export const insertUserSchema = createInsertSchema(user, {
  email: z.string().email().min(MIN_EMAIL_LENGTH).max(MAX_EMAIL_LENGTH),
  displayName: z.string().min(MIN_DISPLAY_NAME_LENGTH).max(MAX_DISPLAY_NAME_LENGTH),
  firstName: z.string().min(MIN_FIRST_NAME_LENGTH).max(MAX_FIRST_NAME_LENGTH).nullable(),
  lastName: z.string().min(MIN_LAST_NAME_LENGTH).max(MAX_LAST_NAME_LENGTH).nullable(),
  mobile: z.string().min(5).max(32).nullable(),
});

export const selectUserSchema = createSelectSchema(user);

export const insertTokenSchema = createInsertSchema(token);

export const selectTokenSchema = createSelectSchema(token);

export const insertUserConfigSchema = createInsertSchema(userConfig);

export const selectUserConfigSchema = createSelectSchema(userConfig);

// Types

export type NewUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;

export type NewToken = z.infer<typeof insertTokenSchema>;
export type Token = z.infer<typeof selectTokenSchema>;

export type NewUserConfig = z.infer<typeof insertUserConfigSchema>;
export type UserConfig = z.infer<typeof selectUserConfigSchema>;
