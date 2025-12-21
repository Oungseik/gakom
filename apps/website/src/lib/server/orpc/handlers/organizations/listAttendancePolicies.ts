import { attendancePolicy, count, eq } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
});

export const listAttendancePoliciesHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["admin", "owner"]))
  .handler(async () => {});
