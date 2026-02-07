import { createRouterClient } from "@orpc/server";

import { os } from "./base";
import { healthCheckHandler } from "./handlers/health/health_check";
import { deleteImageHandler } from "./handlers/images/delete";
import { uploadImageHandler } from "./handlers/images/upload";

export const router = os.router({
  health: { check: healthCheckHandler },
  images: {
    upload: uploadImageHandler,
    delete: deleteImageHandler,
  },
});

/** only for server-side call */
export const client = createRouterClient(router);

export type Router = typeof router;
