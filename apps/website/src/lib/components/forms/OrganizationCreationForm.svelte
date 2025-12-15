<script lang="ts">
  import Loader2Icon from "@lucide/svelte/icons/loader-2";
  import { Button } from "@repo/ui/button";
  import * as ImageCropper from "@repo/ui/image-cropper";
  import { getFileFromUrl } from "@repo/ui/image-cropper";
  import { Input } from "@repo/ui/input";
  import { Label } from "@repo/ui/label";
  import { createForm } from "@tanstack/svelte-form";
  import { createMutation } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";
  import z from "zod";

  import { authClient } from "$lib/auth_client";
  import { orpc } from "$lib/orpc_client";

  type Props = {
    onSubmit?: (param: { name: string; slug: string; logo: string }) => void;
    onSubmitError?: () => void;
  };

  let isSubmitting = $state(false);
  const { onSubmit, onSubmitError }: Props = $props();
  let logo: string | undefined = $state(undefined);

  const imageUploadMutation = createMutation(() => orpc.images.upload.mutationOptions());

  const form = createForm(() => ({
    defaultValues: { name: "", slug: "" },
    onSubmit: async ({ value }) => {
      isSubmitting = true;
      const { data, error } = await authClient.organization.checkSlug({ slug: value.slug });

      if (error || data.status) {
        isSubmitting = false;
        toast(`The slug "${value.slug} is already taken."`);
        return;
      }

      if (!logo) {
        isSubmitting = false;
        toast(`Please upload a logo of your organization.`);
        return;
      }

      const submitParam = { ...value, logo };
      await authClient.organization.create(
        { name: value.name, slug: value.slug },
        {
          onSuccess: () => onSubmit?.(submitParam),
          onError: ({ error }) => {
            toast.error(error.message);
            onSubmitError?.();
          },
        }
      );
      isSubmitting = false;
    },
  }));
</script>

<form
  class="space-y-6"
  onsubmit={(e) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  }}
>
  <div class="mx-auto w-fit">
    <ImageCropper.Root
      onCropped={async (url) => {
        isSubmitting = true;
        const file = await getFileFromUrl(url);
        imageUploadMutation.mutate(
          { file },
          {
            onSuccess: (data) => {
              logo = data.objectPath;
            },
            onError: (e) => toast.error(e.message),
            onSettled: () => {
              isSubmitting = false;
            },
          }
        );
      }}
      onUnsupportedFile={(file) => {
        toast.error(`Unsupported file type: ${file.type}`);
      }}
    >
      <ImageCropper.UploadTrigger>
        <ImageCropper.Preview class="rounded-md" />
      </ImageCropper.UploadTrigger>
      <ImageCropper.Dialog>
        <ImageCropper.Cropper cropShape="rect" />
        <ImageCropper.Controls>
          <ImageCropper.Cancel />
          <ImageCropper.Crop />
        </ImageCropper.Controls>
      </ImageCropper.Dialog>
    </ImageCropper.Root>
  </div>

  <div class="space-y-4">
    <form.Field
      name="name"
      validators={{
        onChange: ({ value }) =>
          z.string().min(1, "Name is required").safeParse(value).error?.issues?.at(0)?.message,
      }}
    >
      {#snippet children(field)}
        <div class="space-y-2">
          <Label for={field.name}>Organization Name</Label>
          <Input
            id={field.name}
            name={field.name}
            value={field.state.value}
            onblur={field.handleBlur}
            onchange={(e) => field.handleChange(e.currentTarget.value)}
            placeholder="My Organization"
            required
            disabled={isSubmitting}
          />
          {#if field.state.meta.errors.length}
            <p class="text-sm text-red-500">{field.state.meta.errors}</p>
          {/if}
        </div>
      {/snippet}
    </form.Field>

    <form.Field
      name="slug"
      validators={{
        onChange: ({ value }) =>
          z
            .string()
            .min(1, "Slug is required")
            .max(20, "Slug is too long")
            .safeParse(value)
            .error?.issues?.at(0)?.message,
      }}
    >
      {#snippet children(field)}
        <div class="space-y-2">
          <Label for={field.name}>Slug</Label>
          <Input
            id={field.name}
            name={field.name}
            value={field.state.value}
            onblur={field.handleBlur}
            onchange={(e) => field.handleChange(e.currentTarget.value)}
            placeholder="my-org"
            required
            disabled={isSubmitting}
          />
          {#if field.state.meta.errors.length}
            <p class="text-sm text-red-500">{field.state.meta.errors}</p>
          {/if}
        </div>
      {/snippet}
    </form.Field>

    <Button disabled={isSubmitting} type="submit" class="mt-2 w-full">
      {#if isSubmitting}
        <Loader2Icon class="animate-spin" />
      {:else}
        Create Organization
      {/if}
    </Button>
  </div>
</form>
