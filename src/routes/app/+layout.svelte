<script lang="ts">
  import {
    AppBar,
    AppRail,
    AppRailAnchor,
    AppShell,
    LightSwitch,
    TabAnchor,
    TabGroup,
  } from '@skeletonlabs/skeleton';
  import Minidenticon from 'components/Minidenticon.svelte';
  import type { LayoutData } from './$types';
  import Fa from 'svelte-fa';
  import {
    faArrowLeft, faHammer, faHome,
  } from '@fortawesome/free-solid-svg-icons';
  import { pageTitle } from 'stores/pageTitle';
  import { goto } from '$app/navigation';
  import { SITE_PAGE, currentPage } from 'stores/currentPage';
  import { canGoBack } from 'stores/canGoBack';
  import githubWhite from '$lib/assets/github-mark-white.svg';
  import githubBlack from '$lib/assets/github-mark.svg';
  import { page } from '$app/stores';
  import Logo from 'components/Logo.svelte';
  import { _ } from 'svelte-i18n';
  import { PUBLIC_GITHUB_LINK } from '$env/static/public';
  import { ENABLE_GITHUB_ICON, ENABLE_THEMES } from '$lib/constants';

  export let data: LayoutData;
</script>

<AppShell class="h-screen dark:bg-surface-800 bg-surface-100">
  <svelte:fragment slot="header">
    <AppBar
      gridColumns="grid-cols-3"
      slotDefault="place-self-center"
      slotTrail="place-content-end"
    >
      <svelte:fragment slot="lead">
        {#if $canGoBack}
          <button
            aria-label={$_('go-back')}
            title={$_('go-back')}
            class="p-2 ml-2 transition-all hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full"
            on:click={async () => {
              const url = $canGoBack;

              $canGoBack = null;

              await goto(url ?? '');
            }}
          >
            <Fa icon={faArrowLeft} />
          </button>
        {:else}
          <span />
        {/if}
      </svelte:fragment>

      {#if $page.url.pathname === '/app'}
        <Logo />
      {:else}
        <h3 class="h3">
          {$_($pageTitle)}
        </h3>
      {/if}

      <svelte:fragment slot="trail">
        <div class="flex flex-row items-center justify-center">
          {#if ENABLE_THEMES}
            <div class="hidden md:block">
              <LightSwitch bgDark="bg-surface-400" />
            </div>
          {/if}

          {#if ENABLE_GITHUB_ICON}
            <a
              href={PUBLIC_GITHUB_LINK}
              class="px-3"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>
                <img
                  src={githubWhite}
                  alt="View on GitHub"
                  style="width: 1.5rem; height: 1.5rem;"
                  class="hidden dark:block"
                />

                <img
                  src={githubBlack}
                  alt="View on GitHub"
                  style="width: 1.5rem; height: 1.5rem;"
                  class="block dark:hidden"
                />
              </span>
            </a>
          {/if}
        </div>
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>

  <svelte:fragment slot="sidebarLeft">
    <AppRail class="hidden md:block px-2 !w-24">
      <AppRailAnchor selected={$currentPage === SITE_PAGE.HOME} href="/app">
        <svelte:fragment slot="lead">
          <div class="flex items-center justify-center mb-2">
            <Fa icon={faHome} fw />
          </div>
        </svelte:fragment>

        <span>{$_('page-title.home')}</span>
      </AppRailAnchor>

      {#if data.isModerator}
        <AppRailAnchor selected={$currentPage === SITE_PAGE.MODERATION} href="/app/moderation">
          <svelte:fragment slot="lead">
            <div class="flex items-center justify-center mb-2">
              <Fa icon={faHammer} fw />
            </div>
          </svelte:fragment>

          <span>{$_('page-title.moderation')}</span>
        </AppRailAnchor>
      {/if}

      <AppRailAnchor
        selected={$currentPage === SITE_PAGE.PROFILE}
        href="/app/profile"
      >
        <svelte:fragment slot="lead">
          <div class="flex items-center justify-center mb-2">
            <Minidenticon email={data.user.email} size={1.5} />
          </div>
        </svelte:fragment>

        <span>{$_('page-title.profile')}</span>
      </AppRailAnchor>
    </AppRail>
  </svelte:fragment>

  <div class="rounded-tl-lg bg-surface-50 dark:bg-surface-900 h-full">
    <slot />
  </div>

  <svelte:fragment slot="footer">
    <TabGroup
      justify="justify-center"
      active="variant-filled-primary"
      hover="hover:variant-soft-primary"
      flex="flex-1 lg:flex-none"
      rounded=""
      border=""
      class="bg-surface-100-800-token w-full block md:hidden"
    >
      <TabAnchor selected={$currentPage === SITE_PAGE.HOME} href="/app">
        <svelte:fragment slot="lead">
          <div class="flex items-center justify-center mb-2">
            <Fa icon={faHome} />
          </div>
        </svelte:fragment>

        <span>{$_('page-title.home')}</span>
      </TabAnchor>

      {#if data.isModerator}
        <TabAnchor selected={$currentPage === SITE_PAGE.MODERATION} href="/app/moderation">
          <svelte:fragment slot="lead">
            <div class="flex items-center justify-center mb-2">
              <Fa icon={faHammer} fw />
            </div>
          </svelte:fragment>

          <span>{$_('page-title.moderation')}</span>
        </TabAnchor>
      {/if}

      <TabAnchor
        selected={$currentPage === SITE_PAGE.PROFILE}
        href="/app/profile"
      >
        <svelte:fragment slot="lead">
          <div class="flex items-center justify-center mb-2">
            <Minidenticon email={data.user.email} size={1} />
          </div>
        </svelte:fragment>

        <span>{$_('page-title.profile')}</span>
      </TabAnchor>
    </TabGroup>
  </svelte:fragment>
</AppShell>
