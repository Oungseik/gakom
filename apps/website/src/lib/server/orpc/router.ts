import { createRouterClient } from "@orpc/server";

import { os } from "./base";
import { healthCheckHandler } from "./handlers/health/health_check";
import { removeImageHandler } from "./handlers/images/remove_image";
import { uploadImageHandler } from "./handlers/images/upload_image";

export const router = os.router({
  health: { check: healthCheckHandler },
  images: {
    remove: removeImageHandler,
    upload: uploadImageHandler,
  },
});

/** only for server-side call */
export const client = createRouterClient(router);

export type Router = typeof router;
