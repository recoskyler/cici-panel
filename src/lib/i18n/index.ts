import i18n, { type Config } from 'sveltekit-i18n';
import { dev } from '$app/environment';
import lang from './lang.json';

export const defaultLocale = 'en';

export const config: Config = ({
  log: { level: dev ? 'warn' : 'error' },
  translations: { en: { lang } },
  loaders: [
    {
      locale: 'en',
      key: 'common',
      loader: async () => (
        await import('./locales/common/en.json')
      ).default,
    },
    {
      locale: 'en',
      key: 'auth',
      loader: async () => (
        await import('./locales/auth/en.json')
      ).default,
    },
    {
      locale: 'en',
      key: 'email-verification',
      loader: async () => (
        await import('./locales/email-verification/en.json')
      ).default,
    },
    {
      locale: 'en',
      key: 'error',
      loader: async () => (
        await import('./locales/error/en.json')
      ).default,
    },
    {
      locale: 'en',
      key: 'granular-perms',
      loader: async () => (
        await import('./locales/granular-perms/en.json')
      ).default,
    },
    {
      locale: 'en',
      key: 'page-title',
      loader: async () => (
        await import('./locales/page-title/en.json')
      ).default,
    },
    {
      locale: 'en',
      key: 'password-strength',
      loader: async () => (
        await import('./locales/password-strength/en.json')
      ).default,
    },
    {
      locale: 'en',
      key: 'rate-limiter',
      loader: async () => (
        await import('./locales/rate-limiter/en.json')
      ).default,
    },
    {
      locale: 'en',
      key: 'setup',
      loader: async () => (
        await import('./locales/setup/en.json')
      ).default,
    },
  ],
});

export const {
  t,
  loading,
  locales,
  locale,
  translations,
  loadTranslations,
  addTranslations,
  setLocale,
  setRoute,
} = new i18n(config);

loading.subscribe($loading => $loading && console.log('Loading translations...'));
