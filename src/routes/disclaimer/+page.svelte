<script lang='ts'>
  import { t } from '$lib/i18n';
</script>

<svelte:head>
  <title>{$t('common.app-name')} | {$t('common.disclaimer')}</title>
</svelte:head>

<div class="flex flex-col gap-5 p-10 h-screen text-black bg-white">
  <h1 class="h1">DISCLAIMER</h1>

  <p><strong>Last updated</strong> August 02, 2023</p>

  <h2 class="h2">WEBSITE DISCLAIMER</h2>

  <p>
    The information provided by {$t('common.app-name')} ("we," "us," or "our") on
    https://{$t('common.app-name')}.recoskyler.com (the "Site") and our mobile application is
    for general informational purposes only. All information on the Site and our
    mobile application is provided in good faith, however we make no
    representation or warranty of any kind, express or implied, regarding the
    accuracy, adequacy, validity, reliability, availability, or completeness of
    any information on the Site or our mobile application. UNDER NO CIRCUMSTANCE
    SHALL WE HAVE ANY LIABILITY TO YOU FOR ANY LOSS OR DAMAGE OF ANY KIND
    INCURRED AS A RESULT OF THE USE OF THE SITE OR OUR MOBILE APPLICATION OR
    RELIANCE ON ANY INFORMATION PROVIDED ON THE SITE AND OUR MOBILE APPLICATION.
    YOUR USE OF THE SITE AND OUR MOBILE APPLICATION AND YOUR RELIANCE ON ANY
    INFORMATION ON THE SITE AND OUR MOBILE APPLICATION IS SOLELY AT YOUR OWN
    RISK.
  </p>
</div>
