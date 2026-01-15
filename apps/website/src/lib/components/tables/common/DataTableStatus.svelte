<script lang="ts">
  const statusConfig = {
    PENDING: { class: "dark:text-amber-400" as const, label: "Pending" },
    ACCEPTED: { class: "dark:text-green-400" as const, label: "Accepted" },
    APPROVED: { class: "dark:text-green-400" as const, label: "Approved" },
    REJECTED: { class: "dark:text-red-400" as const, label: "Rejected" },
    CANCELED: { class: "dark:text-purple-400" as const, label: "Canceled" },
    CANCELLED: { class: "dark:text-purple-400" as const, label: "Canceled" },
  } as const;

  let { status }: { status: keyof typeof statusConfig } = $props();

  const config = $derived(statusConfig[status]);
</script>

<p class={["w-fit", config.class]}>
  {config.label}
</p>
