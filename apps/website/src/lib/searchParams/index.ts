import { createSearchParamsSchema } from "runed/kit";

export const returnUrlSchema = createSearchParamsSchema({
  return_url: { type: "string", default: undefined },
});

export const membersTabSchema = createSearchParamsSchema({
  tab: { type: "string", default: "members" },
});

export const attendancesFilterSchema = createSearchParamsSchema({
  search: { type: "string", default: undefined },
  status: {
    type: "array",
    arrayType: "" as "PRESENT" | "LATE" | "EARLY_LEAVE" | "ABSENT" | "INCOMPLETE",
    default: [],
  },
  dateFrom: { type: "string", default: undefined },
  dateTo: { type: "string", default: undefined },
});
