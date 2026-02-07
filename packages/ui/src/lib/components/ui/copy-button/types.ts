import type { ButtonProps } from "@lib/components/ui/button";
import type { UseClipboard } from "@lib/hooks/use-clipboard.svelte";
import type { WithChildren, WithoutChildren } from "bits-ui";
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type CopyButtonPropsWithoutHTML = WithChildren<
  ButtonProps & {
    ref?: HTMLButtonElement | null;
    text: string;
    icon?: Snippet<[]>;
    animationDuration?: number;
    onCopy?: (status: UseClipboard["status"]) => void;
  }
>;

export type CopyButtonProps = CopyButtonPropsWithoutHTML &
  WithoutChildren<HTMLAttributes<HTMLButtonElement>>;
