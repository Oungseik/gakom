<script lang="ts">
  import CheckIcon from "@lucide/svelte/icons/check";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import { Button } from "@repo/ui/button";
  import * as Command from "@repo/ui/command";
  import * as Popover from "@repo/ui/popover";
  import clsx from "clsx";
  import { tick } from "svelte";

  type Props = {
    options: { value: string; label: string }[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    emptyPlaceHolder?: string;
  };

  let { options, value, placeholder, emptyPlaceHolder, onChange }: Props = $props();

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);

  const selectedLabel = $derived(options.find((f) => f.value === value)?.label);

  function closeAndFocusTrigger() {
    open = false;
    tick().then(() => {
      triggerRef.focus();
    });
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger bind:ref={triggerRef} class="w-full">
    {#snippet child({ props })}
      <Button variant="outline" {...props} role="combobox" aria-expanded={open}>
        <div
          class={clsx(
            "flex w-full items-center justify-between text-sm capitalize",
            !selectedLabel ? "opacity-70" : "text-foreground"
          )}
        >
          {selectedLabel || placeholder}
          <ChevronDownIcon class="ml-2 size-4 shrink-0 opacity-50" />
        </div>
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-80 p-0">
    <Command.Root>
      <Command.Input placeholder="Search..." />
      <Command.List>
        <Command.Empty>{emptyPlaceHolder || "No result found."}</Command.Empty>
        <Command.Group>
          {#each options as option (option.label)}
            <Command.Item
              value={option.value}
              onSelect={() => {
                value = option.value;
                onChange?.(value);
                closeAndFocusTrigger();
              }}
            >
              <CheckIcon class="mr-2 size-4 {value !== option.value ? 'text-transparent' : ''}" />
              <span class="capitalize">{option.label}</span>
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
