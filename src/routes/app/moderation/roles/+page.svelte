<script lang="ts">
  import { PER_PAGE } from '$lib/constants';
  import { Paginator, type PaginationSettings } from '@skeletonlabs/skeleton';
  import type { PageData } from './$types';
  import { _ } from 'svelte-i18n';
  import { canGoBack } from '$lib/stores/canGoBack';
  import { SITE_PAGE, currentPage } from '$lib/stores/currentPage';
  import { pageTitle } from '$lib/stores/pageTitle';
  import Fa from 'svelte-fa';
  import { faEdit } from '@fortawesome/free-solid-svg-icons';
  import { goto } from '$app/navigation';

  export let data: PageData;

  $pageTitle = 'page-title.roles';
  $currentPage = SITE_PAGE.MODERATION;
  $canGoBack = '/app/moderation';

  let paginationSettings = {
    page: 0,
    limit: PER_PAGE,
    size: data.roles.length,
    amounts: [5, 10, 25, 50, 100],

  } satisfies PaginationSettings;

  $: paginatedSource = data.roles.slice(
    paginationSettings.page * paginationSettings.limit,
    paginationSettings.page * paginationSettings.limit +
      paginationSettings.limit,
  );
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>{$_('app-name')} | {$_('page-title.roles')}</title>
</svelte:head>

<div class="max-w-7xl flex flex-col gap-5 mx-auto p-5 h-full">
  {#if data.roles.length === 0}
    <div class="mx-auto my-auto max-w-lg flex flex-col items-center gap-5">
      <p>
        {$_('there-are-no-roles-yet')}
      </p>

      <a href="/app/moderation/roles/create" class="btn variant-filled-primary">
        {$_('create-role')}
      </a>
    </div>
  {:else}
    <div class="flex justify-end w-full flex-row">
      <a href="/app/moderation/roles/create" class="btn variant-filled-primary">
        {$_('create-role')}
      </a>
    </div>

    <div class="table-container">
      <table class="table table-hover">
        <thead>
          <tr>
            <th class="table-cell-fit">{$_('auth.name')}</th>
            <th>{$_('description')}</th>

            {#if data.perms.canViewUsers || data.perms.canViewGroups}
              <th class="table-cell-fit">{$_('members')}</th>
            {/if}

            {#if data.perms.canEditRoles}
              <th class="table-cell-fit"></th>
            {/if}
          </tr>
        </thead>

        <tbody>
          {#each paginatedSource as row}
            <tr>
              <td class={`table-cell-fit ${row.deleted ? 'text-red-500' : ''}`}>
                {row.name}
              </td>

              <td class={`${row.deleted ? 'text-red-500' : ''}`}>
                {row.description}
              </td>

              {#if data.perms.canViewUsers || data.perms.canViewGroups}
                <td class="table-cell-fit">
                  {(data.perms.canViewUsers ? row.users.length : 0)
                    + (data.perms.canViewGroups ? row.groups.length : 0)}
                </td>
              {/if}

              {#if data.perms.canEditRoles}
                <td class="table-cell-fit">
                  <div class="flex flex-row gap-3 justify-end">
                    <span
                      class="chip variant-soft hover:variant-filled"
                      role="button"
                      tabindex={1}
                      on:click={_ => goto(`/app/moderation/roles/${row.id}`)}
                      on:keydown={() => { console.log('now what?'); }}
                    >
                      <span>
                        <Fa fw icon={faEdit} />
                      </span>
                      <span>{$_('edit')}</span>
                    </span>
                  </div>
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if data.roles.length > PER_PAGE}
      <Paginator
        bind:settings={paginationSettings}
        showNumerals
        maxNumerals={5}
        showFirstLastButtons={false}
        showPreviousNextButtons={true}
        amountText={$_('items')}
      />
    {/if}
  {/if}
</div>
