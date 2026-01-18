import { createSearchParamsSchema } from "runed/kit";

export const returnUrlSchema = createSearchParamsSchema({
  return_url: { type: "string" },
});

export const membersTabSchema = createSearchParamsSchema({
  tab: { type: "string", default: "members" },
});

export const attendancesFilterSchema = createSearchParamsSchema({
  search: { type: "string" },
  status: {
    type: "array",
    arrayType: "" as "PRESENT" | "LATE" | "EARLY_LEAVE" | "ABSENT" | "INCOMPLETE",
    default: [],
  },
  dateFrom: { type: "string" },
  dateTo: { type: "string" },
});

export const leaveRequestsFilterSchema = createSearchParamsSchema({
  search: { type: "string" },
  status: {
    type: "array",
    arrayType: "" as "PENDING" | "REJECTED" | "APPROVED" | "CANCELLED",
    default: [],
  },
  duration: { type: "number", default: -1 },
  leave: { type: "string", default: "all" },
  dateFrom: { type: "string" },
  dateTo: { type: "string" },
});

export const membersFilterSchema = createSearchParamsSchema({
  search: { type: "string" },
  role: { type: "string" },
  dateFrom: { type: "string" },
  dateTo: { type: "string" },
});
