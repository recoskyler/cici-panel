<script lang='ts'>
  import { faUser } from '@fortawesome/free-solid-svg-icons';
  import Fa from 'svelte-fa';

  export let href = '/app';
  export let icon = faUser;
  export let name = 'Feature';
  export let description = 'Sphinx of black quartz, judge my vow.';
</script>

<a
  href={href}
  class="w-full max-w-xs flex flex-row items-center gap-5 p-5 dark:border-slate-800
    rounded-lg border-2 hover:border-slate-500 cursor-pointer transition-all
    border-slate-300 dark:hover:border-slate-700"
>
  <div>
    <slot name="icon">
      <Fa icon={icon} fw class="text-tertiary-500 text-2xl" />
    </slot>
  </div>

  <div class="flex flex-col gap-1">
    <h4 class="h4">
      <strong>
        <slot name="name">
          {name}
        </slot>
      </strong>
    </h4>

    <p>
      <slot name="description">
        {description}
      </slot>
    </p>
  </div>
</a>
