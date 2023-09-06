<script lang="ts">
  // import type { PageData } from './$types';
  import { pageTitle } from '$lib/stores/pageTitle';
  import { SITE_PAGE, currentPage } from '$lib/stores/currentPage';
  import { canGoBack } from '$lib/stores/canGoBack';
  import { _ } from 'svelte-i18n';

  // export let data: PageData;

  $currentPage = SITE_PAGE.HOME;
  $pageTitle = 'app-name';
  $canGoBack = null;
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>{$_('app-name')} | {$_('app-')}</title>
</svelte:head>

<div class="h-full flex items-center p-2 flex-col gap-5">
  <div class="container mx-auto max-w-lg">
    <h1 class="h1">Hi mom!</h1>
  </div>
</div>
