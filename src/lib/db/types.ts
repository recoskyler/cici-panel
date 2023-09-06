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

export const insertUserConfigSchema = createInsertSchema(userConfig, {
  displayname: z.string().min(MIN_DISPLAY_NAME_LENGTH).max(MAX_DISPLAY_NAME_LENGTH),
  firstname: z.string().min(MIN_FIRST_NAME_LENGTH).max(MAX_FIRST_NAME_LENGTH),
  lastname: z.string().min(MIN_LAST_NAME_LENGTH).max(MAX_LAST_NAME_LENGTH).nullable().optional(),
  mobile: z.string()
    .min(MIN_MOBILE_LENGTH)
    .max(MAX_MOBILE_LENGTH)
    .refine(isMobilePhone)
    .nullable()
    .optional(),
});

export const selectUserConfigSchema = createSelectSchema(userConfig);

// Types

export type NewUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;

export type NewToken = z.infer<typeof insertTokenSchema>;
export type Token = z.infer<typeof selectTokenSchema>;

export type NewUserConfig = z.infer<typeof insertUserConfigSchema>;
export type UserConfig = z.infer<typeof selectUserConfigSchema>;
