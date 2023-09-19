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
    faUserGroup,
    faUserLock,
  } from '@fortawesome/free-solid-svg-icons';
  import {
    ListBox,
    ListBoxItem,
  } from '@skeletonlabs/skeleton';
  import Fa from 'svelte-fa';
  import FieldsRequiredInfo from 'components/FieldsRequiredInfo.svelte';
  import { writable } from 'svelte/store';
  import Minidenticon from 'components/Minidenticon.svelte';
  import type { FullRole } from '$lib/db/types';
  // import { invalidate } from '$app/navigation';

  $currentPage = SITE_PAGE.MODERATION;
  $canGoBack = '/app/moderation/roles';
  $pageTitle = 'page-title.edit-role';

  export let data: PageData;

  const changed = writable(false);

  const { form, enhance, message, delayed, errors, constraints } = superForm(
    data.form,
    {
      onUpdated: ({ form }) => {
        if (form.valid) {
          $changed = false;
          // invalidate('/app/moderation');
        }
      },
    },
  );

  const {
    errors: deleteErrors,
    enhance: deleteEnhance,
    delayed: deleteDelayed,
  } = superForm(data.deleteForm);

  const {
    errors: permDeleteErrors,
    enhance: permDeleteEnhance,
    delayed: permDeleteDelayed,
  } = superForm(data.permDeleteForm);

  const {
    errors: restoreErrors,
    enhance: restoreEnhance,
    delayed: restoreDelayed,
  } = superForm(data.restoreForm);

  const rolePerms = data.userPerms.canSetPermissions
    ? (data.role as FullRole).permissions : [];

  // console.log({ rolePerms, userPerms: data.userPerms, role: data.role });
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>{$_('app-name')} | {$_('page-title.edit-group')}</title>
</svelte:head>

<div
  class="flex mx-auto my-auto max-w-5xl items-stretch flex-col justify-center py-10 px-5 w-full"
>
  <form use:enhance method="post" class="w-full" action="?/save">
    <div
      class="flex mx-auto my-auto items-center lg:items-stretch gap-5
      flex-col lg:flex-row justify-evenly py-10 px-5 w-full"
    >
      <div class="flex max-w-sm items-stretch flex-col w-full">
        <h3 class="h3 mb-5">
          <strong>{$_('role-details')}</strong>
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
            on:input={_ => { $changed = true; }}
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
            placeholder={$_('role-description-placeholder')}
            disabled={$delayed}
            on:input={_ => { $changed = true; }}
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
          || data.userPerms.canSetGroups
          || data.userPerms.canSetPermissions
        ) && data.users.length + data.groups.length + data.permissions.length > 0
      }
        <div class="flex max-w-sm items-stretch flex-col w-full gap-10">
          {#if data.userPerms.canSetUsers && data.users.length > 0}
            <div class="flex flex-col">
              <div class="flex flex-row gap-5 items-center">
                <Fa fw icon={faUserGroup} />
                <h3 class="h3">
                  <strong>{$_('add-users-to-role')}</strong>
                </h3>
              </div>

              <p class="text-slate-600 dark:text-slate-400">
                {$_('select-none-one-or-multiple')}
              </p>

              <div class="py-4 px-2 border-2 border-slate-600 rounded-lg mt-5">
                <ListBox multiple>
                  {#each data.users as user}
                    <ListBoxItem
                      on:change={_ => { $changed = true; }}
                      bind:group={$form.user}
                      name="user"
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

          {#if data.userPerms.canSetGroups && data.groups.length > 0}
            <div class="flex flex-col">
              <div class="flex flex-row gap-5 items-center">
                <Fa fw icon={faUserGroup} />
                <h3 class="h3">
                  <strong>{$_('add-groups-to-role')}</strong>
                </h3>
              </div>

              <p class="text-slate-600 dark:text-slate-400">
                {$_('select-none-one-or-multiple')}
              </p>

              <div class="py-4 px-2 border-2 border-slate-600 rounded-lg mt-5">
                <ListBox multiple>
                  {#each data.groups as group}
                    <ListBoxItem
                      on:change={_ => { $changed = true; }}
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

          {#if data.userPerms.canSetPermissions
            && !data.role.protected
          }
            <div class="flex flex-col">
              <div class="flex flex-row gap-5 items-center">
                <Fa fw icon={faUserLock} />
                <h3 class="h3">
                  <strong>{$_('direct-role-permissions')}</strong>
                </h3>
              </div>

              <p class="text-slate-600 dark:text-slate-400">
                {$_('select-none-one-or-multiple')}
              </p>

              <div class="py-4 px-2 border-2 border-slate-600 rounded-lg mt-5">
                <ListBox multiple>
                  {#each data.permissions as permission}
                    <ListBoxItem
                      on:change={_ => { $changed = true; }}
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
          {:else if data.userPerms.canSetPermissions
            && data.role.protected
          }
            <ul class="list">
              {#each rolePerms as permission}
                <li>
                  <span>
                    <Fa fw icon={faUserLock} />
                  </span>

                  <span class="flex-auto">
                    {$_(permission.name)}
                  </span>
                </li>
              {/each}
            </ul>
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
      value={$delayed ? $_('saving') : $_('save')}
      class={`btn mt-5 w-full ${
        $delayed || !$changed ? 'variant-filled-surface' : 'variant-filled'
      }`}
      disabled={$delayed || !$changed}
    />
  </form>

  {#if !data.role.deleted && data.userPerms.canDelete && !data.role.protected}
    <form
      action="?/delete"
      method="post"
      class="w-full"
      use:deleteEnhance
      id="delete-form"
    >
      <input
        type="submit"
        value={$deleteDelayed ? $_('deleting') : $_('delete-group')}
        class={`btn mt-2 w-full ${
          $deleteDelayed ? 'variant-filled-surface' : 'variant-filled-error'
        }`}
        disabled={$deleteDelayed}
      />

      {#if $deleteErrors._errors}
        <FormError error={$deleteErrors._errors} />
      {/if}
    </form>
  {:else if data.userPerms.canDelete && !data.role.protected}
    <form
      action="?/restore"
      method="post"
      class="w-full"
      use:restoreEnhance
      id="restore-form"
    >
      <input
        type="submit"
        value={$restoreDelayed ? $_('restoring') : $_('restore-group')}
        class={`btn mt-2 w-full ${
          $restoreDelayed ? 'variant-filled-surface' : 'variant-filled'
        }`}
        disabled={$restoreDelayed}
      />

      {#if $restoreErrors._errors}
        <FormError error={$restoreErrors._errors} />
      {/if}
    </form>

    <form
      action="?/permanentlyDelete"
      method="post"
      class="w-full"
      use:permDeleteEnhance
      id="perm-delete-form"
    >
      <input
        type="submit"
        value={$permDeleteDelayed
          ? $_('deleting')
          : $_('permanently-delete-group')}
        class={`btn mt-2 w-full ${
          $permDeleteDelayed ? 'variant-filled-surface' : 'variant-filled-error'
        }`}
        disabled={$permDeleteDelayed}
      />

      {#if $permDeleteErrors._errors}
        <FormError error={$permDeleteErrors._errors} />
      {/if}
    </form>
  {/if}
</div>
