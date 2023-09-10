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

  $currentPage = SITE_PAGE.MODERATION;
  $canGoBack = null;
  $pageTitle = 'page-title.moderation';

  export let data: PageData;
</script>

<div class="flex p-5 flex-col lg:flex-row gap-3 max-w-3xl flex-wrap mx-auto my-auto items-center">
  {#if data.canManageUsers}
    <FeatureCard
      icon={faUsersCog}
      name={ $_('page-title.users') }
      description='Manage users'
      href='/app/moderation/users'
    />
  {/if}

  {#if data.canManageGroups}
    <FeatureCard
      icon={faUserGroup}
      name={ $_('page-title.groups') }
      description='Manage user groups'
      href='/app/moderation/groups'
    />
  {/if}

  {#if data.canManageRoles}
    <FeatureCard
      icon={faListCheck}
      name={ $_('page-title.roles') }
      description='Manage roles'
      href='/app/moderation/roles'
    />
  {/if}
</div>
