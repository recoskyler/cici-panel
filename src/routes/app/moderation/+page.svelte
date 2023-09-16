<script lang='ts'>
  import { canGoBack } from '$lib/stores/canGoBack';
  import { SITE_PAGE, currentPage } from '$lib/stores/currentPage';
  import { pageTitle } from '$lib/stores/pageTitle';
  import {
    faListCheck, faUserGroup, faUsersCog,
  } from '@fortawesome/free-solid-svg-icons';
  import FeatureCard from 'components/FeatureCard.svelte';
  import { _ } from 'svelte-i18n';
  import type { PageData } from './$types';
  import { ENABLE_GRANULAR_PERMISSIONS } from '$lib/constants';

  $currentPage = SITE_PAGE.MODERATION;
  $canGoBack = null;
  $pageTitle = 'page-title.moderation';

  export let data: PageData;
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>{$_('app-name')} | {$_('page-title.moderation')}</title>
</svelte:head>

<div class="flex p-5 flex-col lg:flex-row gap-3 max-w-3xl flex-wrap mx-auto my-auto items-center">
  {#if data.perms.canManageUsers}
    <FeatureCard
      icon={faUsersCog}
      name={ $_('page-title.users') }
      description='Manage users'
      href='/app/moderation/users'
    />
  {/if}

  {#if data.perms.canManageGroups}
    <FeatureCard
      icon={faUserGroup}
      name={ $_('page-title.groups') }
      description='Manage user groups'
      href='/app/moderation/groups'
    />
  {/if}

  {#if data.perms.canManageRoles && ENABLE_GRANULAR_PERMISSIONS}
    <FeatureCard
      icon={faListCheck}
      name={ $_('page-title.roles') }
      description='Manage roles'
      href='/app/moderation/roles'
    />
  {/if}
</div>
