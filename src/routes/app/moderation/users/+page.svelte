<script lang="ts">
  import {
    ENABLE_EMAIL_VERIFICATION, ENABLE_GRANULAR_PERMISSIONS, PER_PAGE,
  } from '$lib/constants';
  import { Paginator, type PaginationSettings } from '@skeletonlabs/skeleton';
  import type { PageData } from './$types';
  import { t } from '$lib/i18n';
  import { canGoBack } from 'stores/canGoBack';
  import { SITE_PAGE, currentPage } from 'stores/currentPage';
  import { pageTitle } from 'stores/pageTitle';
  import Fa from 'svelte-fa';
  import {
    faCircleCheck, faCircleXmark, faEdit,
  } from '@fortawesome/free-solid-svg-icons';
  import { goto } from '$app/navigation';
  import Minidenticon from 'components/Minidenticon.svelte';

  export let data: PageData;

  $pageTitle = 'page-title.users';
  $currentPage = SITE_PAGE.MODERATION;
  $canGoBack = '/app/moderation';

  let paginationSettings = {
    page: 0,
    limit: PER_PAGE,
    size: data.users.length,
    amounts: [5, 10, 25, 50, 100],

  } satisfies PaginationSettings;

  $: paginatedSource = data.users.slice(
    paginationSettings.page * paginationSettings.limit,
    paginationSettings.page * paginationSettings.limit +
      paginationSettings.limit,
  );
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>{$t('common.app-name')} | {$t('page-title.users')}</title>
</svelte:head>

<div class="max-w-7xl flex flex-col gap-5 mx-auto p-5 h-full">
  {#if data.users.length === 0}
    <div class="mx-auto my-auto max-w-lg flex flex-col items-center gap-5">
      <p>
        {$t('common.there-are-no-users-yet')}
      </p>

      <a href="/app/moderation/users/create" class="btn variant-filled-primary">
        {$t('common.create-user')}
      </a>
    </div>
  {:else}
    <div class="flex justify-end w-full flex-row">
      <a href="/app/moderation/users/create" class="btn variant-filled-primary">
        {$t('common.create-user')}
      </a>
    </div>

    <div class="table-container">
      <table class="table table-hover">
        <thead>
          <tr>
            <th class="table-cell-fit"></th>

            <th class="table-cell-fit">{$t('auth.display-name')}</th>
            <th class="table-cell-fit">{$t('auth.first-name')}</th>
            <th class="table-cell-fit">{$t('auth.last-name')}</th>
            <th class="table-cell-fit">{$t('auth.email')}</th>

            {#if data.perms.canViewGroups}
              <th>{$t('common.groups')}</th>
            {/if}

            {#if data.perms.canViewRoles && ENABLE_GRANULAR_PERMISSIONS}
              <th>{$t('common.roles')}</th>
            {/if}

            {#if data.perms.canEditUsers}
              <th class="table-cell-fit"></th>
            {/if}
          </tr>
        </thead>

        <tbody>
          {#each paginatedSource as row}
            <tr class={row.root ? 'font-bold' : ''}>
              <td class="table-cell-fit">
                <div style='display:block; width:1.5rem;'>
                  <Minidenticon email={row.email} size={1.5} />
                </div>
              </td>

              <td class={`table-cell-fit ${row.deleted ? 'text-red-500' : ''}`}>
                {row.config.displayname}
              </td>

              <td class={`table-cell-fit ${row.deleted ? 'text-red-500' : ''}`}>
                {row.config.firstname}
              </td>

              <td class={`table-cell-fit ${row.deleted ? 'text-red-500' : ''}`}>
                {row.config.lastname ?? ''}
              </td>

              <td class={`table-cell-fit ${row.deleted ? 'text-red-500' : ''}`}>
                <div class='flex flex-row gap-3 items-center'>
                  {row.email}

                  {#if !row.deleted}
                    <Fa
                      fw
                      icon={row.verified || !ENABLE_EMAIL_VERIFICATION
                        ? faCircleCheck : faCircleXmark}
                    />
                  {/if}
                </div>
              </td>

              {#if data.perms.canViewGroups}
                <td>
                  <div class="flex flex-row gap-2 flex-wrap align-middle">
                    {#each row.groups as group}
                      <a href={`/app/moderation/groups/${group.id}`}>
                        <span class="badge variant-filled">
                          {group.name}
                        </span>
                      </a>
                    {/each}
                  </div>
                </td>
              {/if}

              {#if data.perms.canViewRoles && ENABLE_GRANULAR_PERMISSIONS}
                <td class='flex flex-col'>
                  <div class="flex flex-row gap-2 flex-wrap">
                    {#each row.directRoles as role}
                      <a href={`/app/moderation/roles/${role.id}`}>
                        <span class="badge variant-ghost">
                          {role.name}
                        </span>
                      </a>
                    {/each}
                  </div>
                </td>
              {/if}

              {#if data.perms.canEditUsers}
                <td class="table-cell-fit">
                  <div class="flex flex-row gap-3 justify-end align-middle">
                    <span
                      class="chip variant-soft hover:variant-filled"
                      role="button"
                      tabindex={1}
                      on:click={_ => goto(`/app/moderation/users/${row.id}`)}
                      on:keydown={() => { console.log('now what?'); }}
                    >
                      <span>
                        <Fa fw icon={faEdit} />
                      </span>
                      <span>{$t('common.edit')}</span>
                    </span>
                  </div>
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if data.users.length > PER_PAGE}
      <Paginator
        bind:settings={paginationSettings}
        showNumerals
        maxNumerals={5}
        showFirstLastButtons={false}
        showPreviousNextButtons={true}
        amountText={$t('common.items')}
      />
    {/if}
  {/if}
</div>
