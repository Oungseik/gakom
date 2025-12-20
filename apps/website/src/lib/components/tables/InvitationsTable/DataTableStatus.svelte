<script lang="ts">
  let { status }: { status: "pending" | "accepted" | "rejected" | "canceled" } = $props();

  const statusConfig = {
    pending: { class: "dark:text-amber-400" as const, label: "Pending" },
    accepted: { class: "dark:text-green-400" as const, label: "Accepted" },
    rejected: { class: "dark:text-red-400" as const, label: "Rejected" },
    canceled: { class: "dark:text-purple-400" as const, label: "Canceled" },
  } as const;

  const config = $derived(statusConfig[status]);
</script>

<p class={["w-fit", config.class]}>
  {config.label}
</p>
