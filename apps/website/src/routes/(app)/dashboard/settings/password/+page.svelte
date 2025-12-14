<script>
  import { breadcrumb } from "$lib/store/breadcrumb.svelte";

  breadcrumb.value = [
    { desc: "Dashboard", href: "/dashboard" },
    { desc: "Password", href: "/dashboard/settings/password" },
  ];
</script>
