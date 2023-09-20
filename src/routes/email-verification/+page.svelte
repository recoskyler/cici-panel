<script lang="ts">
  import { enhance } from '$app/forms';
  import mailbox from '$lib/assets/undraw_mailbox_re_dvds.svg';
  import { t } from '$lib/i18n';
</script>

<svelte:head>
  <title>{$t('common.app-name')} | {$t('email-verification.email-verification')}</title>
</svelte:head>

<div
  class="flex text-center mx-auto my-auto flex-col items-center
  justify-center gap-2 w-full px-5 py-10  max-w-md"
>
  <img class="max-w-xs mb-5" src={mailbox} alt="Mailbox">
  <h1 class="h1">{$t('email-verification.email-verification')}</h1>
  <br />
  <p>{$t('common.please-check-inbox-email-verif')}</p>
  <br />
  <form use:enhance method="post">
    <input type="submit" value="Sign out" class="btn variant-filled-primary" />
  </form>
</div>
