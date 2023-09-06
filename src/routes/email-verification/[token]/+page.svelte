<script lang="ts">
  import mail from 'images/undraw_mail_sent_re_0ofv.svg';
  import { _ } from 'svelte-i18n';
</script>

<svelte:head>
  <title>{$_('app-name')} | {$_('email-verification.email-verification')}</title>
</svelte:head>

<div
  class="flex text-center mx-auto my-auto flex-col
  items-center justify-center gap-2 w-full px-5 py-10 max-w-md"
>
  <img class="max-w-xs mb-5" src={mail} alt={$_('email-verification.email-verified')} />
  <h1 class="h1">{$_('email-verification.email-verified')}</h1>
  <br />
  <p>{$_('email-verification.email-verified-message')}</p>
  <br />
  <a
    href="/app/profile"
    class="btn variant-filled"
  >
    {$_('continue')}
  </a>
</div>
