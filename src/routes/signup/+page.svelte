<script lang="ts">
  import PasswordStrengthMeter from '../../lib/components/PasswordStrengthMeter/PasswordStrengthMeter.svelte';
  import { LightSwitch, popup } from '@skeletonlabs/skeleton';
  import PasswordPopup from 'components/PasswordPopup.svelte';
  import FormError from 'components/FormError.svelte';
  import { passwordPopupFocusBlur } from 'components/PasswordStrengthMeter/helpers';
  import { superForm } from 'sveltekit-superforms/client';
  import type { PageData } from './$types';
  import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
  import Fa from 'svelte-fa';
  import { t } from '$lib/i18n';
  import { ENABLE_THEMES } from '$lib/constants';

  export let data: PageData;

  let passwordVisible = false;

  const { form, errors, constraints, enhance, delayed } = superForm(data.form);

  const handleInput = (e: Event) => {
    if (!e.target) return;

    const target = e.target as HTMLInputElement;

    $form.password = target.value;
  };
</script>

<svelte:head>
  <title>{$t('common.app-name')} | {$t('auth.create-an-account')}</title>
</svelte:head>

<div class="login-cont mx-auto flex-col my-auto w-full py-10 px-5 max-w-sm">
  <h1 class="h2 text-center mb-5">{$t('auth.create-an-account')}</h1>

  <form method="POST" use:enhance>
    <label for="email" class="label mb-2 mt-5">
      <span>{$t('auth.email')}</span>

      <input
        id="email"
        name="email"
        type="email"
        class="input"
        title={$t('auth.email')}
        placeholder={$t('auth.email-placeholder')}
        autocomplete="email"
        disabled={$delayed}
        bind:value={$form.email}
        {...$constraints.email}
      /><br />

      {#if $errors.email}<FormError error={$errors.email} />{/if}
    </label>

    <label for="password" class="label mb-2 mt-5">
      <span>{$t('auth.password')}</span>

      <PasswordPopup password={$form.password} />

      <div class="input-group input-group-divider grid-cols-[1fr_auto] mb-3">
        <input
          id="password"
          name="password"
          class="input"
          type={passwordVisible ? 'text' : 'password'}
          placeholder={$t('auth.password-placeholder')}
          disabled={$delayed}
          value={$form.password}
          use:popup={passwordPopupFocusBlur}
          on:input={handleInput}
          {...$constraints.password}
        />

        <button
          on:click={e => {
            e.preventDefault();
            passwordVisible = !passwordVisible;
          }}
          type="button"
          class="flex items-center justify-center"
          title={$t('auth.show-hide-password')}
        >
          <Fa fw icon={passwordVisible ? faEye : faEyeSlash} />
        </button>
      </div>

      <br />

      {#if $errors.password}<FormError error={$errors.password} />{/if}
    </label>

    <PasswordStrengthMeter password={$form.password} />

    <p class="text-center text-slate-600 dark:text-slate-400">
      <span>{$t('auth.by-continuing-you-agree-pt1')}</span>
      <br />
      <a class="anchor" href="/disclaimer">{$t('common.disclaimer')}</a>
      <span>, </span>
      <a class="anchor" href="/cookie">{$t('common.cookie-policy')}</a>
      <span>, {$t('common.and')} </span>
      <a class="anchor" href="/privacy">{$t('common.privacy-policy')}</a>
      <br />
      <span>{$t('auth.by-continuing-you-agree-pt2')}</span>
    </p>

    <input
      type="submit"
      value={$delayed ? $t('auth.signing-up') : $t('common.continue')}
      class={`btn mt-5 w-full ${
        $delayed ? 'variant-filled-surface' : 'variant-filled'
      }`}
      disabled={$delayed}
    />
  </form>

  <hr class="!border-t-2 my-5" />

  <p class="text-center">
    <span class="text-slate-600 dark:text-slate-400">
      {$t('auth.already-have-an-account')}
    </span>
    <a class="anchor" href="/login">{$t('auth.sign-in-now')}</a>
  </p>

  {#if ENABLE_THEMES}
    <div class="flex items-center justify-center w-full mt-5">
      <LightSwitch bgDark="bg-surface-400" />
    </div>
  {/if}
</div>
