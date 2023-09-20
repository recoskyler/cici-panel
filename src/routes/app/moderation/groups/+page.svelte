<script lang="ts">
  import { ENABLE_GRANULAR_PERMISSIONS, PER_PAGE } from '$lib/constants';
  import { Paginator, type PaginationSettings } from '@skeletonlabs/skeleton';
  import type { PageData } from './$types';
  import { t } from '$lib/i18n';
  import { canGoBack } from 'stores/canGoBack';
  import { SITE_PAGE, currentPage } from 'stores/currentPage';
  import { pageTitle } from 'stores/pageTitle';
  import Fa from 'svelte-fa';
  import { faEdit } from '@fortawesome/free-solid-svg-icons';
  import { goto } from '$app/navigation';

  export let data: PageData;

  $pageTitle = 'page-title.groups';
  $currentPage = SITE_PAGE.MODERATION;
  $canGoBack = '/app/moderation';

  let paginationSettings = {
    page: 0,
    limit: PER_PAGE,
    size: data.groups.length,
    amounts: [5, 10, 25, 50, 100],

  } satisfies PaginationSettings;

  $: paginatedSource = data.groups.slice(
    paginationSettings.page * paginationSettings.limit,
    paginationSettings.page * paginationSettings.limit +
      paginationSettings.limit,
  );
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>{$t('common.app-name')} | {$t('page-title.groups')}</title>
</svelte:head>

<div class="max-w-7xl flex flex-col gap-5 mx-auto p-5 h-full">
  {#if data.groups.length === 0}
    <div class="mx-auto my-auto max-w-lg flex flex-col items-center gap-5">
      <p>
        {$t('common.there-are-no-groups-yet')}
      </p>

      <a href="/app/moderation/groups/create" class="btn variant-filled-primary">
        {$t('common.create-group')}
      </a>
    </div>
  {:else}
    <div class="flex justify-end w-full flex-row">
      <a href="/app/moderation/users/create" class="btn variant-filled-primary">
        {$t('common.create-group')}
      </a>
    </div>

    <div class="table-container">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>{$t('auth.name')}</th>
            <th>{$t('common.description')}</th>

            {#if data.perms.canViewRoles && ENABLE_GRANULAR_PERMISSIONS}
              <th>{$t('common.roles')}</th>
            {/if}

            {#if data.perms.canViewUsers}
              <th class="table-cell-fit">{$t('common.members')}</th>
            {/if}

            {#if data.perms.canEditGroups}
              <th class="table-cell-fit"></th>
            {/if}
          </tr>
        </thead>

        <tbody>
          {#each paginatedSource as row}
            <tr>
              <td class={row.deleted ? 'text-red-500' : ''}>
                {row.name}
              </td>

              <td class={`${row.deleted ? 'text-red-500' : ''}`}>
                {row.description ?? ''}
              </td>

              {#if data.perms.canViewRoles && ENABLE_GRANULAR_PERMISSIONS}
                <td>
                  <div class="flex flex-row gap-2 flex-wrap">
                    {#each row.roles as role}
                      <a href={`/app/moderation/roles/${role.id}`}>
                        <span class="badge variant-ghost">
                          {role.name}
                        </span>
                      </a>
                    {/each}
                  </div>
                </td>
              {/if}

              {#if data.perms.canViewUsers}
                <td class="table-cell-fit">
                  {row.users.length}
                </td>
              {/if}

              {#if data.perms.canEditGroups}
                <td class="table-cell-fit">
                  <div class="flex flex-row gap-3 justify-end">
                    <span
                      class="chip variant-soft hover:variant-filled"
                      role="button"
                      tabindex={1}
                      on:click={_ => goto(`/app/moderation/groups/${row.id}`)}
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

    {#if data.groups.length > PER_PAGE}
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
