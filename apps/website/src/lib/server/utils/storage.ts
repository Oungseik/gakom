import { S3Client } from "bun";
import {
  STORAGE_ACCESS_KEY_ID,
  STORAGE_BUCKET_NAME,
  STORAGE_ENDPOINT,
  STORAGE_SECRET_ACCESS_KEY,
} from "$env/static/private";
import { getImageContentType } from "$lib/utils";

const storage = new S3Client({
  accessKeyId: STORAGE_ACCESS_KEY_ID,
  secretAccessKey: STORAGE_SECRET_ACCESS_KEY,
  endpoint: STORAGE_ENDPOINT,
  bucket: STORAGE_BUCKET_NAME,
  sessionToken: "",
});

/**
 * @returns object path
 * */
export async function uploadImage(file: Buffer, filename: string, dir?: string): Promise<string> {
  const objPath = `${dir ?? "images"}/${filename}`;
  await storage.write(objPath, file, { type: getImageContentType(filename) });
  return objPath;
}

export async function removeImage(objectPath: string) {
  await storage.delete(objectPath, { bucket: STORAGE_BUCKET_NAME });
  return true;
}
