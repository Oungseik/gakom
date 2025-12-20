import { createSearchParamsSchema } from "runed/kit";

export const returnUrlSchema = createSearchParamsSchema({
  return_url: { type: "string", default: undefined },
});

export const membersTabSchema = createSearchParamsSchema({
  tab: { type: "string", default: "member" },
});
