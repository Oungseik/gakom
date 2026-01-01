<script lang="ts">
  import AttendanceCard from "$lib/components/attendance/AttendanceCard.svelte";

  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Attendance | {data.user.name}</title>
  <meta name="description" content="Employee attendance management dashboard" />
</svelte:head>

<div class="container mx-auto space-y-6 p-4 md:p-6 lg:p-8">
  <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    <div>
      <AttendanceCard user={data.user} />
    </div>
  </div>
</div>
