<script lang="ts">
  const statusConfig = {
    pending: { class: "dark:text-amber-400" as const, label: "Pending" },
    accepted: { class: "dark:text-green-400" as const, label: "Accepted" },
    approved: { class: "dark:text-green-400" as const, label: "Approved" },
    rejected: { class: "dark:text-red-400" as const, label: "Rejected" },
    canceled: { class: "dark:text-purple-400" as const, label: "Canceled" },
    cancelled: { class: "dark:text-purple-400" as const, label: "Canceled" },
  } as const;

  let { status }: { status: keyof typeof statusConfig } = $props();

  const config = $derived(statusConfig[status]);
</script>

<p class={["w-fit", config.class]}>
  {config.label}
</p>
