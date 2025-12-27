<script lang="ts">
  import Loader2Icon from "@lucide/svelte/icons/loader-2";
  import type { Day } from "@repo/db";
  import { TIMEZONES } from "@repo/db/timezone";
  import { Button, buttonVariants } from "@repo/ui/button";
  import * as Dialog from "@repo/ui/dialog";
  import { Input } from "@repo/ui/input";
  import { Label } from "@repo/ui/label";
  import * as Select from "@repo/ui/select";
  import { createForm } from "@tanstack/svelte-form";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";
  import { z } from "zod";

  import { orpc } from "$lib/orpc_client";
  import { secondsToTime, timeToSeconds } from "$lib/utils";

  import type { AttendancePolicy } from "../tables/AttendancePoliciesTable/columns";

  const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

  type Props = {
    open: boolean;
    slug: string;
    policy?: AttendancePolicy | null;
  };

  type TimeZone = (typeof TIMEZONES)[number];

  let { open = $bindable(false), slug, policy }: Props = $props();
  let isSubmitting = $state(false);
  const queryClient = useQueryClient();

  const isEditMode = $derived(!!policy);
  const attendancesPoliciesUpdate = createMutation(() =>
    orpc.organizations.attendancesPolicies.update.mutationOptions()
  );
  const attendancesPoliciesCreate = createMutation(() =>
    orpc.organizations.attendancesPolicies.create.mutationOptions()
  );

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone as TimeZone;
  let timezone = $derived(policy?.timezone ?? (TIMEZONES.includes(tz) ? tz : undefined));

  const defaultValues: {
    name: string;
    timezone?: TimeZone;
    clockIn: string;
    clockOut: string;
    workdays: Day[];
    enabled: boolean;
  } = $derived({
    name: policy?.name ?? "",
    timezone,
    clockIn: policy ? secondsToTime(policy.clockIn) : "09:00",
    clockOut: policy ? secondsToTime(policy.clockOut) : "17:00",
    workdays: policy?.workdays ?? ["MON", "TUE", "WED", "THU", "FRI"],
    enabled: policy?.enabled ?? true,
  });

  const form = createForm(() => ({
    defaultValues,
    onSubmit: async ({ value }) => {
      isSubmitting = true;
      if (!timezone) {
        isSubmitting = false;
        return;
      }

      const data = {
        ...value,
        timezone,
        clockIn: timeToSeconds(value.clockIn),
        clockOut: timeToSeconds(value.clockOut),
      };

      if (policy) {
        updateAttendancePolicy(policy.id, data);
      } else {
        createAttendancePolicy(data);
      }

      isSubmitting = false;
    },
  }));

  function createAttendancePolicy(
    data: Omit<AttendancePolicy, "id" | "organizationId" | "enabled" | "updatedAt">
  ) {
    attendancesPoliciesCreate.mutate(
      { data, slug },
      {
        onSuccess: () => {
          toast.success("Successfully added an attendance policy");
          queryClient.invalidateQueries({
            queryKey: orpc.organizations.attendancesPolicies.list.key(),
          });
          open = false;
        },
        onError: (error) => toast.error(error.message),
      }
    );
  }

  function updateAttendancePolicy(
    id: string,
    data: Omit<AttendancePolicy, "id" | "organizationId" | "updatedAt">
  ) {
    attendancesPoliciesUpdate.mutate(
      { id, data, slug },
      {
        onSuccess: () => {
          toast.success("Successfully updated the attendance policy");
          queryClient.invalidateQueries({
            queryKey: orpc.organizations.attendancesPolicies.list.key(),
          });
          open = false;
        },
        onError: (error) => toast.error(error.message),
      }
    );
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header class="mb-4">
      <Dialog.Title>{isEditMode ? "Edit attendance policy" : "New attendance policy"}</Dialog.Title>
    </Dialog.Header>

    <form
      class="space-y-4"
      onsubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) => {
            const { error } = z.string().min(1).max(100).safeParse(value);
            return error?.issues?.at(0)?.message ?? undefined;
          },
        }}
      >
        {#snippet children(field)}
          <div class="space-y-2">
            <Label for={field.name}>Name</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              type="text"
              onblur={field.handleBlur}
              onchange={(e) => field.handleChange(e.currentTarget.value)}
              placeholder="Standard 9-5"
              required
              disabled={isSubmitting}
            />
            {#if field.state.meta.errors.length}
              <p class="text-sm text-red-500">{field.state.meta.errors}</p>
            {/if}
          </div>
        {/snippet}
      </form.Field>

      <form.Field name="timezone">
        {#snippet children(field)}
          <div class="space-y-2">
            <Label for={field.name}>Timezone</Label>
            <Select.Root
              type="single"
              name={field.name}
              disabled={isSubmitting}
              bind:value={timezone}
            >
              <Select.Trigger class="w-full">{timezone || "Select a timezone"}</Select.Trigger>
              <Select.Content>
                {#each TIMEZONES as t (t)}
                  <Select.Item value={t}>{t}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>
        {/snippet}
      </form.Field>

      <div class="grid grid-cols-2 gap-4">
        <form.Field
          name="clockIn"
          validators={{
            onChange: ({ value }) => {
              const { error } = z
                .string()
                .regex(/^\d{2}:\d{2}$/)
                .safeParse(value);
              return error?.issues?.at(0)?.message ?? undefined;
            },
          }}
        >
          {#snippet children(field)}
            <div class="space-y-2">
              <Label for={field.name}>Clock In</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                type="time"
                onblur={field.handleBlur}
                onchange={(e) => field.handleChange(e.currentTarget.value)}
                disabled={isSubmitting}
                class="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
              {#if field.state.meta.errors.length}
                <p class="text-sm text-red-500">{field.state.meta.errors}</p>
              {/if}
            </div>
          {/snippet}
        </form.Field>

        <form.Field
          name="clockOut"
          validators={{
            onChange: ({ value }) => {
              const { error } = z
                .string()
                .regex(/^\d{2}:\d{2}$/)
                .safeParse(value);
              return error?.issues?.at(0)?.message ?? undefined;
            },
          }}
        >
          {#snippet children(field)}
            <div class="space-y-2">
              <Label for={field.name}>Clock Out</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                type="time"
                onblur={field.handleBlur}
                onchange={(e) => field.handleChange(e.currentTarget.value)}
                disabled={isSubmitting}
                class="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
              {#if field.state.meta.errors.length}
                <p class="text-sm text-red-500">{field.state.meta.errors}</p>
              {/if}
            </div>
          {/snippet}
        </form.Field>
      </div>

      <form.Field name="workdays">
        {#snippet children(field)}
          <div class="space-y-2">
            <Label>Workdays</Label>
            <div class="flex flex-wrap gap-2">
              {#each DAYS as day}
                <label class="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.state.value.includes(day)}
                    onchange={(e) => {
                      const checked = e.currentTarget.checked;
                      if (checked) {
                        field.handleChange([...field.state.value, day]);
                      } else {
                        field.handleChange(field.state.value.filter((d: string) => d !== day));
                      }
                    }}
                    disabled={isSubmitting}
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span class="text-sm">{day}</span>
                </label>
              {/each}
            </div>
          </div>
        {/snippet}
      </form.Field>

      <Dialog.Footer>
        <Dialog.Close class={buttonVariants({ variant: "outline" })}>Cancel</Dialog.Close>
        <Button type="submit" disabled={isSubmitting} class="w-17">
          {#if isSubmitting}
            <Loader2Icon class="size-4 animate-spin" />
          {:else}
            {isEditMode ? "Update" : "Create"}
          {/if}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
