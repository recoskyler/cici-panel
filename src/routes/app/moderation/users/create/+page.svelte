<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import type { PageData } from './$types';
  import FormError from 'components/FormError.svelte';
  import FormSuccess from 'components/FormSuccess.svelte';
  import { canGoBack } from 'stores/canGoBack';
  import { SITE_PAGE, currentPage } from 'stores/currentPage';
  import { t } from '$lib/i18n';
  import { pageTitle } from 'stores/pageTitle';
  import PasswordStrengthMeter from 'components/PasswordStrengthMeter/PasswordStrengthMeter.svelte';
  import {
    faCheck,
    faEye,
    faEyeSlash,
    faUserGear,
    faUserGroup,
    faUserLock,
  } from '@fortawesome/free-solid-svg-icons';
  import {
    ListBox,
    ListBoxItem,
    SlideToggle,
    popup,
  } from '@skeletonlabs/skeleton';
  import PasswordPopup from 'components/PasswordPopup.svelte';
  import { passwordPopupFocusBlur } from 'components/PasswordStrengthMeter/helpers';
  import Fa from 'svelte-fa';
  import FieldsRequiredInfo from 'components/FieldsRequiredInfo.svelte';
  import { ENABLE_EMAIL_VERIFICATION, ENABLE_GRANULAR_PERMISSIONS } from '$lib/constants';

  $currentPage = SITE_PAGE.MODERATION;
  $canGoBack = '/app/moderation/users';
  $pageTitle = 'page-title.create-user';

  export let data: PageData;

  let passwordVisible = false;

  const { form, enhance, message, delayed, errors, constraints } = superForm(
    data.form,
  );

  const handleInput = (e: Event) => {
    if (!e.target) return;

    const target = e.target as HTMLInputElement;

    $form.password = target.value;
  };
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>{$t('common.app-name')} | {$t('page-title.create-user')}</title>
</svelte:head>

<div
  class="flex mx-auto my-auto max-w-5xl items-stretch flex-col justify-center py-10 px-5 w-full"
>
  <form use:enhance method="post" class="w-full">
    <div
      class="flex mx-auto my-auto items-center lg:items-stretch gap-5
      flex-col lg:flex-row justify-evenly py-10 px-5 w-full"
    >
      <div class="flex max-w-sm items-stretch flex-col w-full">
        <h3 class="h3 mb-5">
          <strong>{$t('common.user-details')}</strong>
        </h3>

        <label for="displayname" class="label mb-2">
          <span>{$t('auth.display-name')}*</span>

          <input
            id="displayname"
            name="displayname"
            type="text"
            class="input"
            title={$t('auth.display-name')}
            placeholder={$t('auth.display-name-placeholder')}
            disabled={$delayed}
            bind:value={$form.displayname}
            {...$constraints.displayname}
          /><br />

          {#if $errors.displayname}<FormError
              error={$errors.displayname}
            />{/if}
        </label>

        <label for="firstname" class="label mb-2 mt-5">
          <span>{$t('auth.first-name')}*</span>

          <input
            id="firstname"
            name="firstname"
            type="text"
            class="input"
            title={$t('auth.first-name')}
            placeholder={$t('auth.first-name-placeholder')}
            disabled={$delayed}
            bind:value={$form.firstname}
            {...$constraints.firstname}
          /><br />

          {#if $errors.firstname}<FormError error={$errors.firstname} />{/if}
        </label>

        <label for="lastname" class="label mb-2 mt-5">
          <span>{$t('auth.last-name')}</span>

          <input
            id="lastname"
            name="lastname"
            type="text"
            class="input"
            title={$t('auth.last-name')}
            placeholder={$t('auth.last-name-placeholder')}
            disabled={$delayed}
            bind:value={$form.lastname}
            {...$constraints.lastname}
          /><br />

          {#if $errors.lastname}<FormError error={$errors.lastname} />{/if}
        </label>

        <label for="mobile" class="label mb-2 mt-5">
          <span>{$t('auth.mobile')}</span>

          <input
            id="mobile"
            name="mobile"
            type="text"
            class="input"
            title={$t('auth.mobile')}
            placeholder={$t('auth.mobile-placeholder')}
            disabled={$delayed}
            bind:value={$form.mobile}
            {...$constraints.mobile}
          /><br />

          {#if $errors.mobile}<FormError error={$errors.mobile} />{/if}
        </label>

        <label for="email" class="label mb-2 mt-5">
          <span>{$t('auth.email')}*</span>

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
          <span>{$t('auth.password')}*</span>

          <PasswordPopup password={$form.password} />

          <div
            class="input-group input-group-divider grid-cols-[1fr_auto] mb-3"
          >
            <input
              id="password"
              name="password"
              class="input"
              type={passwordVisible ? 'text' : 'password'}
              placeholder={$t('auth.password')}
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

        {#if ENABLE_EMAIL_VERIFICATION}
          <SlideToggle
            name="verified"
            bind:checked={$form.verified}
            bgDark="bg-surface-400"
            class="mt-10 mb-5"
          >
            {$t('common.do-not-require-email-verification-from-user')}
          </SlideToggle>
        {/if}
      </div>

      {#if
        (
          data.userPerms.canSetGroups
          || data.userPerms.canSetRoles
          || data.userPerms.canSetPermissions
        ) && data.groups.length + data.roles.length + data.permissions.length > 0
      }
        <div class="flex max-w-sm items-stretch flex-col w-full gap-10">
          {#if data.userPerms.canSetGroups && data.groups.length > 0}
            <div class="flex flex-col">
              <div class="flex flex-row gap-5 items-center">
                <Fa fw icon={faUserGroup} />
                <h3 class="h3">
                  <strong>{$t('common.add-user-to-groups')}</strong>
                </h3>
              </div>

              <p class="text-slate-600 dark:text-slate-400">
                {$t('common.select-none-one-or-multiple')}
              </p>

              <div class="py-4 px-2 border-2 border-slate-600 rounded-lg mt-5">
                <ListBox multiple>
                  {#each data.groups as group}
                    <ListBoxItem
                      bind:group={$form.group}
                      name="group"
                      value={group.id}
                      rounded="rounded-lg"
                    >
                      <svelte:fragment slot="lead">
                        <Fa fw icon={faUserGroup} />
                      </svelte:fragment>
                      <p>
                        <strong>{group.name}</strong>
                        {#if group.description && group.description.trim() !== ''}
                          <br />
                          <span class="text-sm">
                            {group.description}
                          </span>
                        {/if}
                      </p>
                      <svelte:fragment slot="trail">
                        {#if $form.group.includes(group.id)}
                          <Fa fw icon={faCheck} />
                        {/if}
                      </svelte:fragment>
                    </ListBoxItem>
                  {/each}
                </ListBox>
              </div>
            </div>
          {/if}

          {#if data.userPerms.canSetRoles
            && data.roles.length > 0
            && ENABLE_GRANULAR_PERMISSIONS
          }
            <div class="flex flex-col">
              <div class="flex flex-row gap-5 items-center">
                <Fa fw icon={faUserGear} />
                <h3 class="h3">
                  <strong>{$t('common.user-roles')}</strong>
                </h3>
              </div>

              <p class="text-slate-600 dark:text-slate-400">
                {$t('common.select-none-one-or-multiple')}
              </p>

              <div class="py-4 px-2 border-2 border-slate-600 rounded-lg mt-5">
                <ListBox multiple>
                  {#each data.roles as role}
                    <ListBoxItem
                      bind:group={$form.role}
                      name="role"
                      value={role.id}
                      rounded="rounded-lg"
                    >
                      <svelte:fragment slot="lead">
                        <Fa fw icon={faUserGear} />
                      </svelte:fragment>
                      <p>
                        <strong>{role.name}</strong>
                        {#if role.description && role.description.trim() !== ''}
                          <br />
                          <span class="text-sm">
                            {role.description}
                          </span>
                        {/if}
                      </p>
                      <svelte:fragment slot="trail">
                        {#if $form.role.includes(role.id)}
                          <Fa fw icon={faCheck} />
                        {/if}
                      </svelte:fragment>
                    </ListBoxItem>
                  {/each}
                </ListBox>
              </div>
            </div>
          {/if}

          {#if data.userPerms.canSetPermissions
            && data.permissions.length > 0
            && ENABLE_GRANULAR_PERMISSIONS
          }
            <div class="flex flex-col">
              <div class="flex flex-row gap-5 items-center">
                <Fa fw icon={faUserLock} />
                <h3 class="h3">
                  <strong>{$t('common.direct-user-permissions')}</strong>
                </h3>
              </div>

              <p class="text-slate-600 dark:text-slate-400">
                {$t('common.select-none-one-or-multiple')}
              </p>

              <div class="py-4 px-2 border-2 border-slate-600 rounded-lg mt-5">
                <ListBox multiple>
                  {#each data.permissions as permission}
                    <ListBoxItem
                      bind:group={$form.permission}
                      name="permission"
                      value={permission.name}
                      rounded="rounded-lg"
                    >
                      <svelte:fragment slot="lead">
                        <Fa fw icon={faUserLock} />
                      </svelte:fragment>
                      {$t(permission.name)}
                      <svelte:fragment slot="trail">
                        {#if $form.permission.includes(permission.name)}
                          <Fa fw icon={faCheck} />
                        {/if}
                      </svelte:fragment>
                    </ListBoxItem>
                  {/each}
                </ListBox>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    {#if $errors._errors}
      <FormError error={$errors._errors} />
    {/if}

    {#if $message}
      <FormSuccess message={$message} />
    {/if}

    <FieldsRequiredInfo />

    <input
      type="submit"
      value={$delayed ? $t('common.creating-user') : $t('common.create-user')}
      class={`btn mt-5 w-full ${
        $delayed ? 'variant-filled-surface' : 'variant-filled'
      }`}
      disabled={$delayed}
    />
  </form>
</div>
