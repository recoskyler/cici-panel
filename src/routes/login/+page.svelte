<script lang="ts">
  import FormError from 'components/FormError.svelte';
  import { superForm } from 'sveltekit-superforms/client';
  import type { PageData } from './$types';
  import { LightSwitch } from '@skeletonlabs/skeleton';
  import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
  import Fa from 'svelte-fa';
  import { _ } from 'svelte-i18n';
  import {
    ALLOW_REGISTERS, ENABLE_PASSWORD_RESETS, ENABLE_THEMES,
  } from '$lib/constants';

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
  <title>{$_('app-name')} | {$_('auth.sign-in')}</title>
</svelte:head>

<div class="login-cont mx-auto flex-col my-auto py-10 px-5 w-full max-w-sm">
  <h1 class="h2 text-center mb-5">{$_('auth.sign-in')}</h1>

  <form method="POST" use:enhance>
    <label for="email" class="label mb-5">
      <span>{$_('auth.email')}</span>

      <input
        id="email"
        name="email"
        type="email"
        class="input mb-5"
        title={$_('auth.email')}
        placeholder={$_('auth.email-placeholder')}
        autocomplete="email"
        disabled={$delayed}
        bind:value={$form.email}
        {...$constraints.email}
      /><br />
    </label>

    {#if $errors.email}<FormError error={$errors.email} />{/if}

    <label for="password" class="label mb-5">
      <span>{$_('auth.password')}</span>

      <div class="input-group input-group-divider grid-cols-[1fr_auto] mb-5">
        <input
          id="password"
          name="password"
          class="input"
          type={passwordVisible ? 'text' : 'password'}
          title={$_('auth.password')}
          placeholder={$_('auth.password-placeholder')}
          disabled={$delayed}
          value={$form.password}
          on:input={handleInput}
          {...$constraints.password}
        />

        <button
          on:click={e => {
            e.preventDefault();
            passwordVisible = !passwordVisible;
          }}
          class="flex items-center justify-center"
          type="button"
          title={$_('auth.show-hide-password')}
        >
          <Fa fw icon={passwordVisible ? faEye : faEyeSlash} />
        </button>
      </div>

      <br />
    </label>

    {#if $errors.password}<FormError error={$errors.password} />{/if}

    {#if $errors?._errors}<FormError error={$errors._errors} />{/if}

    {#if ENABLE_PASSWORD_RESETS}
      <p class="text-center">
        <span class="text-slate-600 dark:text-slate-400">
          {$_('forgot-your-password')}
        </span>
        <a class="anchor" href="/password-reset">{$_('auth.reset-password')}</a>
      </p>
    {/if}

    <input
      type="submit"
      value={$delayed ? $_('auth.signing-in') : $_('continue')}
      class={`btn mt-5 w-full ${
        $delayed ? 'variant-filled-surface' : 'variant-filled'
      }`}
      disabled={$delayed}
    />
  </form>

  {#if ALLOW_REGISTERS || ENABLE_THEMES}
    <hr class="!border-t-2 my-5" />
  {/if}

  {#if ALLOW_REGISTERS}
    <p class="text-center">
      <span class="text-slate-600 dark:text-slate-400">
        {$_('dont-have-an-account')}
      </span>
      <a class="anchor" href="/signup">{$_('auth.register-now')}</a>
    </p>
  {/if}

  {#if ENABLE_THEMES}
    <div class="flex items-center justify-center w-full mt-5">
      <LightSwitch bgDark="bg-surface-400" />
    </div>
  {/if}
</div>
