import { and, eq, image } from "@repo/db";
import z from "zod";
import { STORAGE_PUBLIC_URL } from "$env/static/private";
import { db } from "$lib/server/db";
import { authMiddleware, os } from "$lib/server/orpc/base";
import { removeImage } from "$lib/server/storage";

const input = z.object({
  objectPath: z.string(),
});

export const removeImageHandler = os
  .use(authMiddleware)
  .input(input)
  .handler(async ({ input, context }) => {
    await db
      .delete(image)
      .where(
        and(eq(image.objectPath, input.objectPath), eq(image.uploaderId, context.session.user.id)),
      );
    await removeImage(input.objectPath.slice(STORAGE_PUBLIC_URL.length + 1));
  });
