<script lang="ts">
  import type { PageData } from './$types';
  import {
    Stepper, Step, LightSwitch,
  } from '@skeletonlabs/skeleton';
  import { superForm } from 'sveltekit-superforms/client';
  import { _ } from 'svelte-i18n';
  import {
    ENABLE_THEMES,
    MAX_DISPLAY_NAME_LENGTH,
    MAX_FIRST_NAME_LENGTH,
    MAX_LAST_NAME_LENGTH,
    MAX_MOBILE_LENGTH,
    MIN_DISPLAY_NAME_LENGTH,
    MIN_FIRST_NAME_LENGTH,
    MIN_LAST_NAME_LENGTH,
    MIN_MOBILE_LENGTH,
  } from '$lib/constants';
  import FormError from 'components/FormError.svelte';
  import FieldsRequiredInfo from 'components/FieldsRequiredInfo.svelte';

  export let data: PageData;

  const { form, errors, constraints, enhance, delayed } = superForm(data.form);
  const appName = $_('app-name') as string;

  const onComplete = () => {
    const submitButton = document.getElementById('submit-btn');

    if (!submitButton) return;

    submitButton.click();
  };
</script>

<div
  class="flex flex-col justify-center items-center w-full px-5 py-10 my-auto"
>
  <Stepper
    class="container max-w-md border-solid border-slate-700 border-2 p-5 rounded-lg"
    on:complete={onComplete}
  >
    <Step>
      <svelte:fragment slot="header">
        {$_('welcome-msg', { values: { place: appName } })}
      </svelte:fragment>

      {$_('setup.lets-get-started-with-your-user-account-setup')}
    </Step>

    <Step>
      <svelte:fragment slot="header">{$_('what-is-this-app')}</svelte:fragment>

      {$_('app-description')}
    </Step>

    <Step
      locked={($form.displayname ?? '').trim() === '' ||
        ($form.displayname ?? '').trim().length < MIN_DISPLAY_NAME_LENGTH ||
        ($form.displayname ?? '').trim().length > MAX_DISPLAY_NAME_LENGTH}
    >
      <svelte:fragment slot="header"
        >{$_('what-should-we-call-you')}</svelte:fragment
      >

      <label for="displayname" class="label mb-2">
        <span>{$_('auth.display-name')}*</span>

        <input
          id="displayname"
          name="displayname"
          type="text"
          class="input"
          title={$_('auth.display-name')}
          placeholder={$_('auth.display-name-placeholder')}
          disabled={$delayed}
          bind:value={$form.displayname}
          {...$constraints.displayname}
        /><br />

        {#if $errors.displayname}<FormError error={$errors.displayname} />{/if}
      </label>

      <FieldsRequiredInfo />
    </Step>

    <Step
      locked={($form.firstname ?? '').trim() === '' ||
        ($form.firstname ?? '').trim().length < MIN_FIRST_NAME_LENGTH ||
        ($form.firstname ?? '').trim().length > MAX_FIRST_NAME_LENGTH}
    >
      <svelte:fragment slot="header">
        {$_('what-is-your-first-name')}
      </svelte:fragment>

      <label for="firstname" class="label mb-2">
        <span>{$_('auth.first-name')}*</span>

        <input
          id="firstname"
          name="firstname"
          type="text"
          class="input"
          title={$_('auth.first-name')}
          placeholder={$_('auth.first-name-placeholder')}
          disabled={$delayed}
          bind:value={$form.firstname}
          {...$constraints.firstname}
        /><br />

        {#if $errors.firstname}<FormError error={$errors.firstname} />{/if}
      </label>

      <FieldsRequiredInfo />
    </Step>

    <Step
      locked={($form.lastname ?? '').trim() !== '' &&
        (($form.lastname ?? '').trim().length < MIN_LAST_NAME_LENGTH ||
          ($form.lastname ?? '').trim().length > MAX_LAST_NAME_LENGTH)}
    >
      <svelte:fragment slot="header">
        {$_('what-is-your-last-name-optional')}
      </svelte:fragment>

      <label for="lastname" class="label mb-2">
        <span>{$_('auth.last-name')}</span>

        <input
          id="lastname"
          name="lastname"
          type="text"
          class="input"
          title={$_('auth.last-name')}
          placeholder={$_('auth.last-name-placeholder')}
          disabled={$delayed}
          bind:value={$form.lastname}
          {...$constraints.lastname}
        /><br />

        {#if $errors.lastname}<FormError error={$errors.lastname} />{/if}
      </label>
    </Step>

    <Step
      locked={($form.mobile ?? '').trim() !== '' &&
        (($form.mobile ?? '').trim().length < MIN_MOBILE_LENGTH ||
          ($form.mobile ?? '').trim().length > MAX_MOBILE_LENGTH)}
    >
      <svelte:fragment slot="header">
        {$_('what-is-your-mobile-number-optional')}
      </svelte:fragment>

      <label for="mobile" class="label mb-2">
        <span>{$_('auth.mobile')}</span>

        <input
          id="mobile"
          name="mobile"
          type="text"
          class="input"
          title={$_('auth.mobile')}
          placeholder={$_('auth.mobile-placeholder')}
          disabled={$delayed}
          bind:value={$form.mobile}
          {...$constraints.mobile}
        /><br />

        {#if $errors.mobile}<FormError error={$errors.mobile} />{/if}
      </label>
    </Step>
  </Stepper>

  <form action="?/signOut" method="post" class="w-full my-5 max-w-md">
    <input
      type="submit"
      class="btn variant-filled-primary w-full"
      value="Sign out"
    />
  </form>

  {#if ENABLE_THEMES}
    <div class="flex items-center justify-center w-full">
      <LightSwitch bgDark="bg-surface-400" />
    </div>
  {/if}
</div>

<form
  use:enhance
  method="post"
  id="submit-form"
  class="hidden"
  action="?/submit"
>
  <input
    type="hidden"
    bind:value={$form.displayname}
    name="displayname"
    required
  />
  <input type="hidden" bind:value={$form.firstname} name="firstname" required />
  <input type="hidden" bind:value={$form.lastname} name="lastname" required />
  <input type="hidden" bind:value={$form.mobile} name="mobile" required />
  <input type="submit" id="submit-btn" />
</form>
