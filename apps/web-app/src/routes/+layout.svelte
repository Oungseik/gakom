<script lang="ts">
  import "@fontsource/inter";
  import { ModeWatcher } from "mode-watcher";

  import "../app.css";
  import type { LayoutProps } from "./$types";

  let { children }: LayoutProps = $props();
</script>

<svelte:head></svelte:head>

<ModeWatcher />
{@render children()}
