<script lang="ts">
  import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '$lib/constants';
  import { _ } from 'svelte-i18n';

  export let password: string;

  const isLengthValid = (password: string) =>
    password.length >= MIN_PASSWORD_LENGTH &&
    password.length <= MAX_PASSWORD_LENGTH;

  const containsLowercase = (password: string) => /(?=.*[a-z])/.test(password);
  const containsUppercase = (password: string) => /(?=.*[A-Z])/.test(password);
  const containsNumber = (password: string) => /(?=.*[0-9])/.test(password);
  const containsSpecial = (password: string) => /(?=.*\W)/.test(password);
</script>

<div class="card p-4 variant-filled max-w-xs z-50" data-popup="popupFocusBlur">
  <p><strong>{$_('password-recommendations')}</strong></p>
  <br />
  <p>{$_('password-popup-info')}</p>
  <br />

  <ul>
    <li
      class={password.length === 0
        ? ''
        : isLengthValid(password)
          ? 'text-green-400 dark:text-green-700'
          : 'text-red-400 dark:text-red-700'}
    >
      <span class="text-sm">
        {password.length === 0 || !isLengthValid(password) ? '❌' : '🟢'}
      </span>
      {$_('password-min-max-long', { values: { min: MIN_PASSWORD_LENGTH, max: MAX_PASSWORD_LENGTH } })}
    </li>

    <li
      class={password.length === 0
        ? ''
        : containsLowercase(password)
          ? 'text-green-400 dark:text-green-700'
          : 'text-red-400 dark:text-red-700'}
    >
      <span class="text-sm">
        {password.length === 0 || !containsLowercase(password) ? '❌' : '🟢'}
      </span>
      {$_('minimum-1-lowercase-letter-a-z')}
    </li>

    <li
      class={password.length === 0
        ? ''
        : containsUppercase(password)
          ? 'text-green-400 dark:text-green-700'
          : 'text-red-400 dark:text-red-700'}
    >
      <span class="text-sm">
        {password.length === 0 || !containsUppercase(password) ? '❌' : '🟢'}
      </span>
      {$_('minimum-1-uppercase-letter-a-z')}
    </li>

    <li
      class={password.length === 0
        ? ''
        : containsNumber(password)
          ? 'text-green-400 dark:text-green-700'
          : 'text-red-400 dark:text-red-700'}
    >
      <span class="text-sm">
        {password.length === 0 || !containsNumber(password) ? '❌' : '🟢'}
      </span>
      {$_('minimum-1-number-0-9')}
    </li>

    <li
      class={password.length === 0
        ? ''
        : containsSpecial(password)
          ? 'text-green-400 dark:text-green-700'
          : 'text-red-400 dark:text-red-700'}
    >
      <span class="text-sm">
        {password.length === 0 || !containsSpecial(password) ? '❌' : '🟢'}
      </span>
      {$_('minimum-1-special-character')}
    </li>
  </ul>

  <div class="arrow variant-filled" />
</div>
