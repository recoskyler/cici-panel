<script lang="ts">
  import FormError from 'components/FormError.svelte';
  import { isEmailValid } from '$lib/functions/validators.js';
  import type { PageData } from './$types';
  import { superForm } from 'sveltekit-superforms/client';
  import FormSuccess from 'components/FormSuccess.svelte';
  import { LightSwitch } from '@skeletonlabs/skeleton';
  import { _ } from 'svelte-i18n';
  import { ENABLE_THEMES } from '$lib/constants';

  export let data: PageData;

  const { form, delayed, enhance, message, errors, constraints } = superForm(
    data.form,
  );
</script>

<svelte:head>
  <title>{$_('app-name')} | { $_('reset-password') }</title>
</svelte:head>

<div class="login-cont mx-auto flex-col my-auto w-full px-5 py-10 max-w-sm">
  <h1 class="h2 text-center mb-5">{ $_('reset-password') }</h1>

  <form method="POST" use:enhance>
    <label for="email" class="label mb-2">{$_('auth.email')}</label>

    <input
      id="email"
      name="email"
      type="email"
      class="input mb-5"
      title={$_('auth.email')}
      placeholder={$_('auth.email-placeholder')}
      autocomplete="email"
      disabled={!!$message || $delayed}
      bind:value={$form.email}
      {...$constraints.email}
    /><br />

    {#if $errors.email}<FormError error={$errors.email} />{/if}

    {#if $message}<FormSuccess message={$message} />{/if}

    <input
      type="submit"
      value={$delayed ? $_('loading') : $_('continue')}
      class={`btn w-full ${
        isEmailValid($form.email) && !$delayed && !$message
          ? 'variant-filled'
          : 'variant-filled-surface'
      }`}
      disabled={!isEmailValid($form.email) || $delayed || $message}
    />
  </form>

  {#if $message}
    <a href="/login" class="btn variant-filled-primary w-full mt-5">
      { $_('auth.back-to-login') }
    </a>
  {/if}

  {#if ENABLE_THEMES}
    <div class="flex items-center justify-center w-full mt-5">
      <LightSwitch bgDark="bg-surface-400" />
    </div>
  {/if}
</div>
