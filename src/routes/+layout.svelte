<script>
  import '$lib/styles/app.postcss';
  import {
    computePosition, autoUpdate, offset, shift, flip, arrow,
  } from '@floating-ui/dom';
  import {
    Drawer, Modal, storePopup,
  } from '@skeletonlabs/skeleton';
  import { initializeStores } from '@skeletonlabs/skeleton';

  initializeStores();
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
</script>

<Modal />
<Drawer />

<div class="app">
  <slot />
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow-y: auto;
  }
</style>
