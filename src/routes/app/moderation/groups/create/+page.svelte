<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import type { PageData } from './$types';
  import FormError from 'components/FormError.svelte';
  import FormSuccess from 'components/FormSuccess.svelte';
  import { canGoBack } from 'stores/canGoBack';
  import { SITE_PAGE, currentPage } from 'stores/currentPage';
  import { _ } from 'svelte-i18n';
  import { pageTitle } from 'stores/pageTitle';
  import {
    faCheck,
    faUserGear,
    faUserGroup,
    faUserLock,
  } from '@fortawesome/free-solid-svg-icons';
  import {
    ListBox,
    ListBoxItem,
  } from '@skeletonlabs/skeleton';
  import Fa from 'svelte-fa';
  import FieldsRequiredInfo from 'components/FieldsRequiredInfo.svelte';
  import Minidenticon from 'components/Minidenticon.svelte';
  import { ENABLE_GRANULAR_PERMISSIONS } from '$lib/constants';

  $currentPage = SITE_PAGE.MODERATION;
  $canGoBack = '/app/moderation/groups';
  $pageTitle = 'page-title.create-group';

  export let data: PageData;

  const { form, enhance, message, delayed, errors, constraints } = superForm(
    data.form,
  );
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>{$_('app-name')} | {$_('page-title.create-group')}</title>
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
          <strong>{$_('group-details')}</strong>
        </h3>

        <label for="name" class="label mb-2">
          <span>{$_('name')}*</span>

          <input
            id="name"
            name="name"
            type="text"
            class="input"
            title={$_('name')}
            placeholder={$_('group-name-placeholder')}
            disabled={$delayed}
            bind:value={$form.name}
            {...$constraints.name}
          /><br />

          {#if $errors.name}
            <FormError error={$errors.name} />
          {/if}
        </label>

        <label for="description" class="label mb-2 mt-5">
          <span>{$_('description')}</span>

          <input
            id="description"
            name="description"
            type="text"
            class="input"
            title={$_('description')}
            placeholder={$_('group-description-placeholder')}
            disabled={$delayed}
            bind:value={$form.description}
            {...$constraints.description}
          /><br />

          {#if $errors.description}
            <FormError error={$errors.description} />
          {/if}
        </label>
      </div>

      {#if
        (
          data.userPerms.canSetUsers
          || data.userPerms.canSetRoles
          || data.userPerms.canSetPermissions
        ) && data.users.length + data.roles.length + data.permissions.length > 0
      }
        <div class="flex max-w-sm items-stretch flex-col w-full gap-10">
          {#if data.userPerms.canSetUsers && data.users.length > 0}
            <div class="flex flex-col">
              <div class="flex flex-row gap-5 items-center">
                <Fa fw icon={faUserGroup} />
                <h3 class="h3">
                  <strong>{$_('add-users-to-group')}</strong>
                </h3>
              </div>

              <p class="text-slate-600 dark:text-slate-400">
                {$_('select-none-one-or-multiple')}
              </p>

              <div class="py-4 px-2 border-2 border-slate-600 rounded-lg mt-5">
                <ListBox multiple>
                  {#each data.users as user}
                    <ListBoxItem
                      bind:group={$form.user}
                      name="group"
                      value={user.id}
                      rounded="rounded-lg"
                    >
                      <svelte:fragment slot="lead">
                        <Minidenticon email={user.email} size={1.5} />
                      </svelte:fragment>

                      <p>
                        <strong>
                          {`${user.config.firstname} ${user.config.lastname ?? ''} (${user.config.displayname})`}
                        </strong>
                        <br />
                        <span class="text-sm">
                          {user.email}
                        </span>
                      </p>

                      <svelte:fragment slot="trail">
                        {#if $form.user.includes(user.id)}
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
                  <strong>{$_('group-roles')}</strong>
                </h3>
              </div>

              <p class="text-slate-600 dark:text-slate-400">
                {$_('select-none-one-or-multiple')}
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
                  <strong>{$_('direct-group-permissions')}</strong>
                </h3>
              </div>

              <p class="text-slate-600 dark:text-slate-400">
                {$_('select-none-one-or-multiple')}
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
                      {$_(permission.name)}
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
      value={$delayed ? $_('creating-group') : $_('create-group')}
      class={`btn mt-5 w-full ${
        $delayed ? 'variant-filled-surface' : 'variant-filled'
      }`}
      disabled={$delayed}
    />
  </form>
</div>
