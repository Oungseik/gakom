<script lang="ts">
  import * as Table from "@repo/ui/table";

  type Props = {
    colspan: number;
  };

  const { colspan }: Props = $props();
</script>

<Table.Row>
  <Table.Cell {colspan} class="h-24 text-center">No results.</Table.Cell>
</Table.Row>
