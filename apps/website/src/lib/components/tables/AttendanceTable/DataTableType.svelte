<script lang="ts">
  import { Badge } from "@repo/ui/badge";

  type Props = {
    type: "CHECK_IN" | "CHECK_OUT";
  };

  let { type }: Props = $props();

  const typeConfig = {
    CHECK_IN: {
      label: "Check In",
      variant: "default",
    },
    CHECK_OUT: {
      label: "Check Out",
      variant: "secondary",
    },
  } as const;
</script>

<Badge variant={typeConfig[type].variant}>
  {typeConfig[type].label}
</Badge>
