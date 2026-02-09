<script lang="ts" generics="Value">
  import { buttonVariants } from "@repo/ui/button";
  import { Checkbox } from "@repo/ui/checkbox";
  import { Label } from "@repo/ui/label";
  import * as Popover from "@repo/ui/popover";
  import * as RadioGroup from "@repo/ui/radio-group";
  import type { Component } from "svelte";

  type Multiple = {
    value: Value[];
    multiple: true;
  };

  type Props = {
    icon: Component;
    desc: string;
    data: { value: Value; label: string }[];
    onCheckedChange: (v: Value) => void;
  } & (Multiple | { value: Value });

  const props: Props = $props();
</script>

<Popover.Root>
  <Popover.Trigger class={buttonVariants({ variant: "outline" })}>
    <props.icon class="size-4" />
    {props.desc}
  </Popover.Trigger>
  <Popover.Content align="start" class="w-52 p-4">
    <div class="space-y-3">
      {#if "multiple" in props}
        {#each props.data as datum (datum.value)}
          <div class="flex items-center space-x-3">
            <Checkbox
              id={String(datum.value)}
              checked={Array.isArray(props.value)
                ? props.value.includes(datum.value)
                : props.value === datum.value}
              onCheckedChange={() => {
                props.onCheckedChange(datum.value);
              }}
            />
            <Label for={String(datum.value)} class="w-full cursor-pointer text-sm font-medium">
              {datum.label}
            </Label>
          </div>
        {/each}
      {:else}
        <RadioGroup.Root
          value={String(props.value)}
          onValueChange={(value) =>
            props.onCheckedChange(props.data.find((v) => String(v.value) === value)?.value!)}
        >
          {#each props.data as datum (datum.value)}
            {@const value = String(datum.value)}
            <div class="flex items-center space-x-2">
              <RadioGroup.Item {value} id={value} />
              <Label class="w-full cursor-pointer text-sm font-medium" for={value}
                >{datum.label}</Label
              >
            </div>
          {/each}
        </RadioGroup.Root>
      {/if}
    </div>
  </Popover.Content>
</Popover.Root>
