<script>
  import { page } from '$app/stores';
  import { t } from '$lib/i18n';
</script>

<div
  class="h-screen flex flex-col justify-center align-center max-w-lg mx-auto gap-5 p-5"
>
  <strong class="h1 text-red-400">{$page?.status ?? '500'}</strong>

  <span class="h2 text-red-400">
    {$t($page?.error?.message ?? 'an_error_occurred')}
  </span>
</div>
