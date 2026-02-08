<script lang="ts" generics="TData, TValue">
  import { FlexRender, createSvelteTable } from "@repo/ui/data-table";
  import { ScrollArea, Scrollbar } from "@repo/ui/scroll-area";
  import * as Table from "@repo/ui/table";
  import { type ColumnDef, type RowSelectionState, getCoreRowModel } from "@tanstack/table-core";

  import DataTableRowLoading from "../common/DataTableRowLoading.svelte";
  import DataTableRowNoResults from "../common/DataTableRowNoResults.svelte";

  type DataTableProps<TData, TValue> = {
    loading?: boolean;
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    border?: boolean;
    rowSelection?: RowSelectionState;
  };

  let {
    data,
    columns,
    loading,
    border = true,
    rowSelection = $bindable({}),
  }: DataTableProps<TData, TValue> = $props();

  const table = $derived(
    createSvelteTable({
      get data() {
        return data;
      },
      state: {
        get rowSelection() {
          return rowSelection;
        },
      },
      columns,
      onRowSelectionChange: (updater) => {
        if (typeof updater === "function") {
          rowSelection = updater(rowSelection);
        } else {
          rowSelection = updater;
        }
      },
      getCoreRowModel: getCoreRowModel(),
    })
  );
</script>

<ScrollArea class="grid w-full grid-cols-1 overflow-auto">
  <div class={["overflow-x-auto rounded-md", border && "border"]}>
    <Table.Root>
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head colspan={header.colSpan}>
                {#if !header.isPlaceholder}
                  <FlexRender
                    content={header.column.columnDef.header}
                    context={header.getContext()}
                  />
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row data-state={row.getIsSelected() && "selected"}>
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell>
                <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
              </Table.Cell>
            {/each}
          </Table.Row>
        {:else}
          {#if loading}
            <DataTableRowLoading colspan={columns.length} />
          {:else}
            <DataTableRowNoResults colspan={columns.length} />
          {/if}
        {/each}
      </Table.Body>
    </Table.Root>
  </div>
  <Scrollbar orientation="horizontal" />
</ScrollArea>
