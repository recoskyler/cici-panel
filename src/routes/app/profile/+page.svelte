<script lang="ts">
  import {
    Accordion,
    AccordionItem,
    LightSwitch,
  } from '@skeletonlabs/skeleton';
  import { popup } from '@skeletonlabs/skeleton';
  import { passwordPopupFocusBlur } from 'components/PasswordStrengthMeter/helpers.js';
  import type { PageData } from './$types';
  import Minidenticon from 'components/Minidenticon.svelte';
  import { pageTitle } from 'stores/pageTitle';
  import FormError from 'components/FormError.svelte';
  import PasswordStrengthMeter from 'components/PasswordStrengthMeter/PasswordStrengthMeter.svelte';
  import Fa from 'svelte-fa';
  import {
    faEnvelope,
    faEye,
    faEyeSlash,
    faIdBadge,
    faKey,
    faTrash,
  } from '@fortawesome/free-solid-svg-icons';
  import { superForm } from 'sveltekit-superforms/client';
  import PasswordPopup from 'components/PasswordPopup.svelte';
  import FormSuccess from 'components/FormSuccess.svelte';
  import { canGoBack } from 'stores/canGoBack';
  import { SITE_PAGE, currentPage } from 'stores/currentPage';
  import { toTitleCase } from '$lib/functions/helper';
  import { _ } from 'svelte-i18n';
  import FieldsRequiredInfo from 'components/FieldsRequiredInfo.svelte';
  import { PUBLIC_GITHUB_LINK } from '$env/static/public';
  import { ENABLE_THEMES } from '$lib/constants';

  export let data: PageData;

  const {
    form: cpForm,
    errors: cpErrors,
    constraints: cpConstraints,
    enhance: cpEnhance,
    message: cpMessage,
    delayed: cpDelayed,
  } = superForm(data.changePasswordForm);

  const {
    form: ceForm,
    errors: ceErrors,
    constraints: ceConstraints,
    enhance: ceEnhance,
    message: ceMessage,
    delayed: ceDelayed,
  } = superForm(data.changeEmailForm);

  const {
    form: daForm,
    errors: daErrors,
    constraints: daConstraints,
    enhance: daEnhance,
    message: daMessage,
    delayed: daDelayed,
  } = superForm(data.deleteAccountForm);

  const {
    form: cnForm,
    errors: cnErrors,
    constraints: cnConstraints,
    enhance: cnEnhance,
    message: cnMessage,
    delayed: cnDelayed,
  } = superForm(data.changeUserConfigForm);

  $pageTitle = 'page-title.profile';
  $currentPage = SITE_PAGE.PROFILE;
  $canGoBack = null;

  // let analyticsEnabled = false;
  let daCurrentPwVisible = false;
  let ceCurrentPwVisible = false;
  let cpCurrentPwVisible = false;
  let cpNewPwVisible = false;

  // const toggleAnalytics = () => {
  //   if (!browser) {
  //     console.error('Not a browser. Cannot save settings');

  //     return;
  //   }

  //   setCookie(
  //     DO_NOT_TRACK_COOKIE_NAME,
  //     analyticsEnabled ? 'false' : 'true',
  //     365,
  //   );

  //   console.info(`${analyticsEnabled ? 'Enabled' : 'Disabled'} analytics`);
  // };

  const handleCECurrentPasswordInput = (e: Event) => {
    if (!e.target) return;

    const target = e.target as HTMLInputElement;

    $ceForm.password = target.value;
  };

  const handleCPCurrentPasswordInput = (e: Event) => {
    if (!e.target) return;

    const target = e.target as HTMLInputElement;

    $cpForm.currentPassword = target.value;
  };

  const handleCPNewPasswordInput = (e: Event) => {
    if (!e.target) return;

    const target = e.target as HTMLInputElement;

    $cpForm.password = target.value;
  };

  const handleDACurrentPasswordInput = (e: Event) => {
    if (!e.target) return;

    const target = e.target as HTMLInputElement;

    $daForm.password = target.value;
  };

  // onMount(() => {
  //   const cookieVal = getCookie(DO_NOT_TRACK_COOKIE_NAME);
  //   analyticsEnabled = cookieVal === 'false' || cookieVal === '' ? true : false;
  // });
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>{$_('app-name')} | {$_('page-title.profile')}</title>
</svelte:head>

<main
  class=" h-full flex flex-col mx-auto my-auto p-5 max-w-md auto-cols-min"
  id="profile-cont"
>
  <div class="flex flex-row gap-5">
    <div class="flex justify-center items-center">
      <Minidenticon email={data.user.email} size={4} />
    </div>

    <div class="flex flex-col items-start gap-2">
      <h4 class="h4">
        <strong>
          {data.user.config.firstname}
          {data.user.config.lastname ?? ''}
        </strong>

        ({data.user.config.displayname})
      </h4>

      <p>{data.user.email}</p>
    </div>
  </div>

  <div class="flex flex-row gap-2 flex-wrap mt-5">
    {#each data.user.allRoles as role}
      <span class="badge variant-ghost">
        {$_(role.name)}
      </span>
    {/each}
  </div>

  <form method="post" action="?/signOut" class="w-full mt-2">
    <input
      type="submit"
      value="Sign out"
      class="btn variant-filled-primary mt-5 w-full"
    />
  </form>

  <Accordion class="mt-10" autocollapse>
    {#if data.userPerms.canChangeDetails}
      <AccordionItem>
        <svelte:fragment slot="lead">
          <Fa fw icon={faIdBadge} />
        </svelte:fragment>

        <svelte:fragment slot="summary">{$_('change-details')}</svelte:fragment>

        <svelte:fragment slot="content">
          <form use:cnEnhance action="?/changeUserConfig" method="post">
            <label for="displayname" class="label mb-2">
              <span>{$_('auth.display-name')}*</span>

              <input
                id="displayname"
                name="displayname"
                type="text"
                class="input"
                title={$_('auth.display-name')}
                placeholder={$_('auth.display-name-placeholder')}
                disabled={$cnDelayed}
                bind:value={$cnForm.displayname}
                {...$cnConstraints.displayname}
              /><br />

              {#if $cnErrors.displayname}<FormError
                  error={$cnErrors.displayname}
                />{/if}
            </label>

            <label for="firstname" class="label mb-2">
              <span>{$_('auth.first-name')}*</span>

              <input
                id="firstname"
                name="firstname"
                type="text"
                class="input"
                title={$_('auth.first-name')}
                placeholder={$_('auth.first-name-placeholder')}
                disabled={$cnDelayed}
                bind:value={$cnForm.firstname}
                {...$cnConstraints.firstname}
              /><br />

              {#if $cnErrors.firstname}<FormError
                  error={$cnErrors.firstname}
                />{/if}
            </label>

            <label for="lastname" class="label mb-2">
              <span>{$_('auth.last-name')}</span>

              <input
                id="lastname"
                name="lastname"
                type="text"
                class="input"
                title={$_('auth.last-name')}
                placeholder={$_('auth.last-name-placeholder')}
                disabled={$cnDelayed}
                bind:value={$cnForm.lastname}
                {...$cnConstraints.lastname}
              /><br />

              {#if $cnErrors.lastname}<FormError
                  error={$cnErrors.lastname}
                />{/if}
            </label>

            <label for="mobile" class="label mb-2">
              <span>{$_('auth.mobile')}</span>

              <input
                id="mobile"
                name="mobile"
                type="tel"
                class="input"
                title={$_('auth.mobile')}
                placeholder={$_('auth.mobile-placeholder')}
                disabled={$cnDelayed}
                bind:value={$cnForm.mobile}
                {...$cnConstraints.mobile}
              /><br />

              {#if $cnErrors.mobile}<FormError error={$cnErrors.mobile} />{/if}
            </label>

            {#if $cnErrors._errors}
              <FormError error={$cnErrors._errors} />
            {/if}

            {#if $cnMessage}
              <FormSuccess message={$cnMessage} />
            {/if}

            <FieldsRequiredInfo />

            <input
              type="submit"
              value={$cnDelayed ? $_('saving') : $_('save')}
              class={`btn mt-5 w-full ${
                $cnDelayed ? 'variant-filled-surface' : 'variant-filled'
              }`}
              disabled={$cnDelayed}
            />
          </form>
        </svelte:fragment>
      </AccordionItem>
    {/if}

    {#if data.userPerms.canChangeEmail}
      <AccordionItem>
        <svelte:fragment slot="lead">
          <Fa fw icon={faEnvelope} />
        </svelte:fragment>

        <svelte:fragment slot="summary">{$_('change-email')}</svelte:fragment>

        <svelte:fragment slot="content">
          <form use:ceEnhance action="?/changeEmail" method="post">
            <label class="label mb-3 mt-5">
              <span>{$_('auth.current-password')}*</span>

              <div class="input-group input-group-divider grid-cols-[1fr_auto]">
                <input
                  name="password"
                  class="input"
                  type={ceCurrentPwVisible ? 'text' : 'password'}
                  aria-label={$_('auth.current-password')}
                  placeholder={$_('auth.current-password-placeholder')}
                  disabled={$ceDelayed}
                  value={$ceForm.password}
                  on:input={handleCECurrentPasswordInput}
                  {...$ceConstraints.password}
                />

                <button
                  on:click={e => {
                    e.preventDefault();
                    ceCurrentPwVisible = !ceCurrentPwVisible;
                  }}
                  type="button"
                  class="flex items-center justify-center"
                >
                  <Fa fw icon={ceCurrentPwVisible ? faEye : faEyeSlash} />
                </button>
              </div>

              {#if $ceErrors.password}
                <FormError error={$ceErrors.password} />
              {/if}
            </label>

            <label class="label">
              <span>{$_('new-email')}*</span>

              <input
                name="email"
                class="input"
                type="email"
                placeholder={$_('auth.email-placeholder')}
                aria-label={$_('auth.email')}
                disabled={$ceDelayed}
                bind:value={$ceForm.email}
                {...$ceConstraints.email}
              />

              {#if $ceErrors.email}
                <FormError error={$ceErrors.email} />
              {/if}
            </label>

            {#if $ceErrors._errors}
              <FormError error={$ceErrors._errors} />
            {/if}

            {#if $ceMessage}
              <FormSuccess message={$ceMessage} />
            {/if}

            <FieldsRequiredInfo />

            <input
              type="submit"
              value={$ceDelayed ? $_('saving') : $_('change-email')}
              class={`btn mt-5 w-full ${
                $ceDelayed ? 'variant-filled-surface' : 'variant-filled'
              }`}
              disabled={$ceDelayed}
            />
          </form>
        </svelte:fragment>
      </AccordionItem>
    {/if}

    {#if data.userPerms.canChangePassword}
      <AccordionItem>
        <svelte:fragment slot="lead">
          <Fa fw icon={faKey} />
        </svelte:fragment>

        <svelte:fragment slot="summary">{$_('change-password')}</svelte:fragment
        >

        <svelte:fragment slot="content">
          <form use:cpEnhance action="?/changePassword" method="post">
            <label class="label mb-3 mt-5">
              <span>{$_('auth.current-password')}*</span>

              <div class="input-group input-group-divider grid-cols-[1fr_auto]">
                <input
                  name="currentPassword"
                  class="input"
                  type={cpCurrentPwVisible ? 'text' : 'password'}
                  aria-label={$_('auth.current-password')}
                  placeholder={$_('auth.current-password-placeholder')}
                  disabled={$cpDelayed}
                  value={$cpForm.currentPassword}
                  on:input={handleCPCurrentPasswordInput}
                  {...$cpConstraints.currentPassword}
                />

                <button
                  on:click={e => {
                    e.preventDefault();
                    cpCurrentPwVisible = !cpCurrentPwVisible;
                  }}
                  type="button"
                  class="flex items-center justify-center"
                >
                  <Fa fw icon={cpCurrentPwVisible ? faEye : faEyeSlash} />
                </button>
              </div>

              {#if $cpErrors.currentPassword}
                <FormError error={$cpErrors.currentPassword} />
              {/if}
            </label>

            <PasswordPopup password={$cpForm.password} />

            <label class="label">
              <span>{$_('auth.new-password')}*</span>

              <div class="input-group input-group-divider grid-cols-[1fr_auto]">
                <input
                  name="password"
                  class="input"
                  type={cpNewPwVisible ? 'text' : 'password'}
                  placeholder={$_('auth.new-password-placeholder')}
                  disabled={$cpDelayed}
                  value={$cpForm.password}
                  use:popup={passwordPopupFocusBlur}
                  on:input={handleCPNewPasswordInput}
                  {...$cpConstraints.password}
                />

                <button
                  on:click={e => {
                    e.preventDefault();
                    cpNewPwVisible = !cpNewPwVisible;
                  }}
                  type="button"
                  class="flex items-center justify-center"
                >
                  <Fa fw icon={cpNewPwVisible ? faEye : faEyeSlash} />
                </button>
              </div>

              {#if $cpErrors.password}
                <FormError error={$cpErrors.password} />
              {/if}
            </label>

            <PasswordStrengthMeter password={$cpForm.password} />

            {#if $cpErrors._errors}
              <FormError error={$cpErrors._errors} />
            {/if}

            {#if $cpMessage}
              <FormSuccess message={$cpMessage} />
            {/if}

            <FieldsRequiredInfo />

            <input
              type="submit"
              value={$cpDelayed ? $_('saving') : $_('change-password')}
              class={`btn mt-5 w-full ${
                $cpDelayed ? 'variant-filled-surface' : 'variant-filled'
              }`}
              disabled={$cpDelayed}
            />
          </form>
        </svelte:fragment>
      </AccordionItem>
    {/if}

    {#if data.userPerms.canDeleteAccount}
      <AccordionItem>
        <svelte:fragment slot="lead">
          <Fa fw icon={faTrash} class="text-red-600 dark:text-red-400" />
        </svelte:fragment>

        <svelte:fragment slot="summary">
          <span class="text-red-600 dark:text-red-400"
            >{$_('delete-account')}</span
          >
        </svelte:fragment>

        <svelte:fragment slot="content">
          <p>
            <span class="text-orange-600 dark:text-orange-400">
              <strong>{$_('warning')} </strong>
            </span>

            {$_('delete-account-warning')}
          </p>

          <form use:daEnhance method="post" action="?/delete">
            <label class="label mb-3 mt-5">
              <span>{$_('auth.current-password')}*</span>

              <div class="input-group input-group-divider grid-cols-[1fr_auto]">
                <input
                  name="password"
                  class="input"
                  type={daCurrentPwVisible ? 'text' : 'password'}
                  aria-label={$_('auth.current-password')}
                  placeholder={$_('auth.current-password-placeholder')}
                  disabled={$daDelayed}
                  value={$daForm.password}
                  on:input={handleDACurrentPasswordInput}
                  {...$daConstraints.password}
                />

                <button
                  on:click={e => {
                    e.preventDefault();
                    daCurrentPwVisible = !daCurrentPwVisible;
                  }}
                  type="button"
                  class="flex items-center justify-center"
                >
                  <Fa fw icon={daCurrentPwVisible ? faEye : faEyeSlash} />
                </button>
              </div>

              {#if $daErrors.password}
                <FormError error={$daErrors.password} />
              {/if}
            </label>

            <label class="label mb-3 mt-5">
              <span>{$_('confirmation')}*</span>

              <input
                name="confirmation"
                class="input"
                type="text"
                placeholder="Delete"
                disabled={$daDelayed}
                bind:value={$daForm.confirmation}
                {...$daConstraints.confirmation}
              />

              {#if $daErrors.confirmation}
                <FormError error={$daErrors.confirmation} />
              {/if}
            </label>

            {#if $daErrors._errors}
              <FormError error={$daErrors._errors} />
            {/if}

            {#if $daMessage}
              <FormSuccess message={$daMessage} />
            {/if}

            <FieldsRequiredInfo />

            <input
              type="submit"
              value={$daDelayed ? $_('exterminating') : $_('delete-account')}
              class={`btn mt-5 w-full ${
                $daDelayed ? 'variant-filled-surface' : 'variant-filled-error'
              }`}
              disabled={$daDelayed}
            />
          </form>
        </svelte:fragment>
      </AccordionItem>
    {/if}
  </Accordion>

  {#if ENABLE_THEMES}
    <div class="w-full flex items-center justify-center md:hidden mt-5">
      <LightSwitch bgDark="bg-surface-400" />
    </div>
  {/if}

  <div
    class="flex flex-row flex-wrap items-center justify-center
    gap-x-3 gap-y-2 mt-10 py-2 px-5 bg-surface-200 dark:bg-surface-200 rounded-lg"
  >
    <a
      href="/privacy"
      target="_blank"
      rel="noopener noreferrer"
      class="anchor text-center"
    >
      {toTitleCase($_('privacy-policy'))}
    </a>

    <a
      href="/disclaimer"
      target="_blank"
      rel="noopener noreferrer"
      class="anchor text-center"
    >
      {toTitleCase($_('disclaimer'))}
    </a>

    <a
      href="/cookie"
      target="_blank"
      rel="noopener noreferrer"
      class="anchor text-center"
    >
      {toTitleCase($_('cookie-policy'))}
    </a>

    <a
      href={`${PUBLIC_GITHUB_LINK}/blob/main/LICENSE`}
      target="_blank"
      rel="noopener noreferrer"
      class="anchor text-center"
    >
      {toTitleCase($_('license'))}
    </a>

    <a
      href={PUBLIC_GITHUB_LINK}
      target="_blank"
      rel="noopener noreferrer"
      class="anchor text-center"
    >
      {toTitleCase($_('source-code'))}
    </a>
  </div>
</main>
