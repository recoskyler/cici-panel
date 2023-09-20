<script lang="ts">
  // import type { PageData } from './$types';
  import { pageTitle } from 'stores/pageTitle';
  import { SITE_PAGE, currentPage } from 'stores/currentPage';
  import { canGoBack } from 'stores/canGoBack';
  import { t } from '$lib/i18n';

  // export let data: PageData;

  $currentPage = SITE_PAGE.HOME;
  $pageTitle = 'page-title.app-name';
  $canGoBack = null;
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>{$t('common.app-name')} | {$t('page-title.home')}</title>
</svelte:head>

<div class="h-full flex items-center p-2 flex-col gap-5">
  <div class="container mx-auto max-w-lg">
    <h1 class="h1">Hi mom!</h1>
  </div>
</div>
