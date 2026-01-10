<script lang="ts">
  import { Button } from "@repo/ui/button";
  import { Spinner } from "@repo/ui/spinner";

  type Props = {
    onclick: () => void;
    disabled: boolean;
    loading: boolean;
  };

  const props: Props = $props();
</script>

<Button variant="outline" onclick={() => props.onclick()} disabled={props.disabled}>
  {#if props.loading}
    <Spinner class="mr-2 size-4" />
    Loading...
  {:else}
    Load More
  {/if}
</Button>
