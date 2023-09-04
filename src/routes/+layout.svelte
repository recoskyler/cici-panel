<script>
  import '../app.postcss';
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

<slot />
