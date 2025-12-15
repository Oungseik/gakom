<script lang="ts">
  import XIcon from "@lucide/svelte/icons/x";
  import { Button } from "@repo/ui/button";
  import { FileDropZone, type FileDropZoneProps, MEGABYTE } from "@repo/ui/file-drop-zone";
  import { createMutation } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";
  import { SvelteDate } from "svelte/reactivity";

  import { orpc } from "$lib/orpc_client";

  type Props = {
    onFileInputChange: (files: UploadedFile[]) => void;
    images: UploadedFile[];
    edit: boolean;
  };

  const { onFileInputChange, images, edit }: Props = $props();

  const onUpload: FileDropZoneProps["onUpload"] = async (files) => {
    await Promise.allSettled(files.map((file) => uploadFile(file)));
  };

  const imageRemoveMutation = createMutation(() => orpc.images.remove.mutationOptions());
  const imageUploadMutation = createMutation(() => orpc.images.upload.mutationOptions());

  const onFileRejected: FileDropZoneProps["onFileRejected"] = async ({ reason, file }) => {
    toast.error(`${file.name} failed to upload!`, { description: reason });
  };

  const uploadFile = async (file: File) => {
    if (files.find((f) => f.filename === file.name)) return;
    const process = imageUploadMutation.mutateAsync({ file });

    files.push({
      filename: file.name,
      type: file.type,
      uploadedAt: new Date(),
      objectPath: process.then((f) => f.objectPath),
    });

    await process;
    onFileInputChange(files);
  };

  type UploadedFile = {
    filename: string;
    type: string;
    uploadedAt: Date;
    objectPath: Promise<string>;
  };

  let files = $derived<UploadedFile[]>(images);
  let date = new SvelteDate();

  $effect(() => {
    const interval = setInterval(() => {
      date.setTime(Date.now());
    }, 10);

    return () => {
      clearInterval(interval);
    };
  });

  function removeImage(objectPath: string, index: number) {
    if (edit) {
      const updatedFiles = [...files.slice(0, index), ...files.slice(index + 1)];
      files = updatedFiles;
      onFileInputChange(updatedFiles);
      return;
    }
    imageRemoveMutation.mutate(
      { objectPath },
      {
        onSuccess: () => (files = [...files.slice(0, index), ...files.slice(index + 1)]),
        onError: (e) => toast.error(e.message),
      }
    );
  }
</script>

<div class="flex w-full flex-col gap-2">
  <FileDropZone
    {onUpload}
    {onFileRejected}
    maxFileSize={2 * MEGABYTE}
    accept="image/*"
    maxFiles={5}
    fileCount={files.length}
  />
  <div class="mt-2 grid grid-cols-3 gap-2 md:grid-cols-5 md:gap-4">
    {#each files as file, i (file.filename)}
      {#await file.objectPath}
        <div class="flex h-20 w-full items-center justify-center">
          <div
            class="animate-spin rounded-full border-4 border-gray-200 border-t-blue-500 sm:size-5 md:size-6"
          ></div>
        </div>
      {:then src}
        <div class="relative h-20">
          <img {src} alt={file.filename} class="h-full w-full rounded-lg object-cover" />
          <Button
            variant="secondary"
            size="icon"
            class="absolute -top-1 -right-1 size-6 rounded-full shadow-lg"
            onclick={() => removeImage(src, i)}
          >
            <XIcon />
          </Button>
        </div>
      {/await}
    {/each}
  </div>
</div>
