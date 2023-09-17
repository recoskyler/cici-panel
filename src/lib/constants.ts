import { dev } from '$app/environment';
import {
  PUBLIC_MIN_PASSWORD_LENGTH,
  PUBLIC_MAX_PASSWORD_LENGTH,
  PUBLIC_MIN_DISPLAY_NAME_LENGTH,
  PUBLIC_MAX_DISPLAY_NAME_LENGTH,
  PUBLIC_MIN_FIRST_NAME_LENGTH,
  PUBLIC_MAX_FIRST_NAME_LENGTH,
  PUBLIC_MIN_LAST_NAME_LENGTH,
  PUBLIC_MAX_LAST_NAME_LENGTH,
  PUBLIC_MIN_EMAIL_LENGTH,
  PUBLIC_MAX_EMAIL_LENGTH,
  PUBLIC_ALLOW_REGISTERS,
  PUBLIC_ENABLE_EMAIL_VERIFICATION,
  PUBLIC_ENABLE_PASSWORD_RESETS,
  PUBLIC_ENABLE_GRANULAR_PERMISSIONS,
  PUBLIC_ENABLE_THEMES,
  PUBLIC_ENABLE_RATE_LIMIT,
  PUBLIC_ENABLE_APP_BAR_GITHUB_ICON,
  PUBLIC_GRANULAR_PERMISSIONS_PREFIX,
  PUBLIC_PAGINATION_PER_PAGE,
} from '$env/static/public';

export const MIN_PASSWORD_LENGTH = Number.parseInt(PUBLIC_MIN_PASSWORD_LENGTH);
export const MAX_PASSWORD_LENGTH = Number.parseInt(PUBLIC_MAX_PASSWORD_LENGTH);
export const MIN_DISPLAY_NAME_LENGTH = Number.parseInt(PUBLIC_MIN_DISPLAY_NAME_LENGTH);
export const MAX_DISPLAY_NAME_LENGTH = Number.parseInt(PUBLIC_MAX_DISPLAY_NAME_LENGTH);
export const MIN_FIRST_NAME_LENGTH = Number.parseInt(PUBLIC_MIN_FIRST_NAME_LENGTH);
export const MAX_FIRST_NAME_LENGTH = Number.parseInt(PUBLIC_MAX_FIRST_NAME_LENGTH);
export const MIN_LAST_NAME_LENGTH = Number.parseInt(PUBLIC_MIN_LAST_NAME_LENGTH);
export const MAX_LAST_NAME_LENGTH = Number.parseInt(PUBLIC_MAX_LAST_NAME_LENGTH);
export const MIN_EMAIL_LENGTH = Number.parseInt(PUBLIC_MIN_EMAIL_LENGTH);
export const MAX_EMAIL_LENGTH = Number.parseInt(PUBLIC_MAX_EMAIL_LENGTH);
export const MIN_MOBILE_LENGTH = 5;
export const MAX_MOBILE_LENGTH = 32;
export const PER_PAGE = (PUBLIC_ALLOW_REGISTERS ?? '').trim() === ''
  ? Number.parseInt(PUBLIC_PAGINATION_PER_PAGE)
  : 25;

export const ALLOW_REGISTERS =
  (PUBLIC_ALLOW_REGISTERS ?? '').trim() === ''
  || (PUBLIC_ALLOW_REGISTERS ?? '').trim().toLowerCase() === 'true'
  || (PUBLIC_ALLOW_REGISTERS ?? '').trim() === '1';

export const ENABLE_EMAIL_VERIFICATION =
  (PUBLIC_ENABLE_EMAIL_VERIFICATION ?? '').trim() === ''
  || (PUBLIC_ENABLE_EMAIL_VERIFICATION ?? '').trim().toLowerCase() === 'true'
  || (PUBLIC_ENABLE_EMAIL_VERIFICATION ?? '').trim() === '1';

export const ENABLE_PASSWORD_RESETS =
  (PUBLIC_ENABLE_PASSWORD_RESETS ?? '').trim() === ''
  || (PUBLIC_ENABLE_PASSWORD_RESETS ?? '').trim().toLowerCase() === 'true'
  || (PUBLIC_ENABLE_PASSWORD_RESETS ?? '').trim() === '1';

export const ENABLE_GRANULAR_PERMISSIONS =
  (PUBLIC_ENABLE_GRANULAR_PERMISSIONS ?? '').trim() === ''
  || (PUBLIC_ENABLE_GRANULAR_PERMISSIONS ?? '').trim().toLowerCase() === 'true'
  || (PUBLIC_ENABLE_GRANULAR_PERMISSIONS ?? '').trim() === '1';

export const ENABLE_THEMES =
  (PUBLIC_ENABLE_THEMES ?? '').trim() === ''
  || (PUBLIC_ENABLE_THEMES ?? '').trim().toLowerCase() === 'true'
  || (PUBLIC_ENABLE_THEMES ?? '').trim() === '1';

export const ENABLE_RATE_LIMIT =
  !dev
  && (
    (PUBLIC_ENABLE_RATE_LIMIT ?? '').trim() === ''
    || (PUBLIC_ENABLE_RATE_LIMIT ?? '').trim().toLowerCase() === 'true'
    || (PUBLIC_ENABLE_RATE_LIMIT ?? '').trim() === '1'
  );

export const ENABLE_GITHUB_ICON =
  (PUBLIC_ENABLE_APP_BAR_GITHUB_ICON ?? '').trim() === ''
  || (PUBLIC_ENABLE_APP_BAR_GITHUB_ICON ?? '').trim().toLowerCase() === 'true'
  || (PUBLIC_ENABLE_APP_BAR_GITHUB_ICON ?? '').trim() === '1';

export const DISCLAIMER_DISMISSED_COOKIE_NAME = 'cicipanel_disclaimer-dismissed';

export const GRANULAR_PERMISSIONS_PREFIX = (PUBLIC_GRANULAR_PERMISSIONS_PREFIX ?? '').trim() === ''
  ? 'granular-perms' : PUBLIC_GRANULAR_PERMISSIONS_PREFIX.trim();
