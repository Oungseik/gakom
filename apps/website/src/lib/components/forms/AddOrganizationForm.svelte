<script lang="ts">
  import Loader2Icon from "@lucide/svelte/icons/loader-2";
  import { Button } from "@repo/ui/button";
  import * as Card from "@repo/ui/card";
  import * as Dialog from "@repo/ui/dialog";
  import * as ImageCropper from "@repo/ui/image-cropper";
  import { getFileFromUrl } from "@repo/ui/image-cropper";
  import { Input } from "@repo/ui/input";
  import { Label } from "@repo/ui/label";
  import { createForm } from "@tanstack/svelte-form";
  import { createMutation } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";
  import z from "zod";

  import FullPageSpinner from "$lib/components/overlays/FullPageSpinner.svelte";
  import { orpc } from "$lib/orpc_client";

  type Props = { variant: "dialog" | "card"; open?: boolean };
  let { variant, open = $bindable(false) }: Props = $props();

  let isSubmitting = $state(false);
  let isUploading = $state(false);
  let logo: string | undefined = $state(undefined);
  let src = $state("");

  const imageUploadMutation = createMutation(() => orpc.images.upload.mutationOptions());
  const createOrganization = createMutation(() => orpc.organizations.create.mutationOptions());

  const form = createForm(() => ({
    defaultValues: { name: "", slug: "" },
    onSubmit: async ({ value }) => {
      if (!logo) {
        isSubmitting = false;
        toast.error(`Please upload a logo of your organization.`);
        return;
      }

      createOrganization.mutate(
        {
          name: value.name,
          slug: value.slug,
          logo,
        },
        {
          onError: (error) => {
            toast.error(error.message);
          },
          onSuccess: () => {
            window.location.href = `/dashboard/${value.slug}`;
          },
          onSettled: () => {
            isSubmitting = false;
          },
        }
      );
    },
  }));
</script>

{#if isUploading}
  <FullPageSpinner />
{/if}

{#snippet Form()}
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
        bind:src
        onCropped={async (url) => {
          isUploading = true;
          const file = await getFileFromUrl(url);
          imageUploadMutation.mutate(
            { file },
            {
              onSuccess: (data) => {
                logo = data.objectPath;
              },
              onError: (e) => {
                toast.error(e.message);
                src = "";
              },
              onSettled: () => {
                isUploading = false;
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
{/snippet}

{#if variant === "dialog"}
  <Dialog.Root bind:open>
    <Dialog.Content>
      {@render Form()}
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <Card.Root>
    <Card.Content>
      {@render Form()}
    </Card.Content>
  </Card.Root>
{/if}
