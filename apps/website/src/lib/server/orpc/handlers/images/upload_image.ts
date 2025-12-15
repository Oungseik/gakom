import { randomUUID } from "node:crypto";
import { image } from "@repo/db";
import sharp from "sharp";
import z from "zod";
import { STORAGE_PUBLIC_URL } from "$env/static/private";

import { db } from "$lib/server/db";
import { authMiddleware, os } from "$lib/server/orpc/base";
import { uploadImage } from "$lib/server/storage";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const input = z.object({
  file: z
    .file()
    .max(MAX_FILE_SIZE, "File size cannot exceed 2MB.")
    .mime(ACCEPTED_IMAGE_TYPES, "Only JPEG, PNG, and WebP images are allowed."),
});

export const uploadImageHandler = os
  .use(authMiddleware)
  .input(input)
  .handler(async ({ input, context }) => {
    const buffer = await input.file.arrayBuffer();
    const result = await sharp(buffer).resize(900, 450).toBuffer();

    const name = input.file.name.split(".");
    name.pop();
    const filename = randomUUID() + "_" + name.join(".").concat(".webp");

    const objPath = await uploadImage(result, filename);
    const values = {
      filename,
      objectPath: `${STORAGE_PUBLIC_URL}/${objPath}`,
      size: result.byteLength,
      uploaderId: context.session.user.id,
    };

    await db.insert(image).values(values);
    return values;
  });
