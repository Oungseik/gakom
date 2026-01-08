<script lang="ts">
  import { getAttendanceStatusBadgeClass } from "$lib/utils";

  type Props = {
    status: "PRESENT" | "LATE" | "EARLY_LEAVE" | "ABSENT" | "INCOMPLETE";
  };

  let { status }: Props = $props();
</script>

<span
  class={[
    "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-gray-500/10 ring-inset",
    getAttendanceStatusBadgeClass(status),
  ]}
>
  {status}
</span>
