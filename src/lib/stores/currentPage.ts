import { writable } from 'svelte/store';

export const SITE_PAGE = {
  HOME: 'HOME',
  PROFILE: 'PROFILE',
  ACCOUNTS: 'ACCOUNTS',
} as const;

type ObjectValues<T> = T[keyof T];

export type ChatterPage = ObjectValues<typeof SITE_PAGE>;

export const currentPage = writable<ChatterPage>(SITE_PAGE.HOME);
