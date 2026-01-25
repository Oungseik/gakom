import { and, count, eq, leave, leaveBalance, leaveRequest } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  id: z.string(),
  slug: z.string(),
});

export const deleteLeavePolicyHandler = os
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ context, input, errors }) => {
    const pendingRequests = await db
      .select({ count: count() })
      .from(leaveRequest)
      .where(and(eq(leaveRequest.leaveId, input.id), eq(leaveRequest.status, "PENDING")));

    if (pendingRequests[0]?.count) {
      throw errors.FORBIDDEN({
        message: "Cannot delete policy with pending leave requests",
      });
    }

    const approvedRequests = await db
      .select({ count: count() })
      .from(leaveRequest)
      .where(and(eq(leaveRequest.leaveId, input.id), eq(leaveRequest.status, "APPROVED")));

    if (approvedRequests[0]?.count) {
      throw errors.FORBIDDEN({
        message: "Cannot delete policy with approved leave requests",
      });
    }

    const balances = await db
      .select({ count: count() })
      .from(leaveBalance)
      .where(eq(leaveBalance.leaveId, input.id));

    if (balances[0]?.count) {
      throw errors.FORBIDDEN({
        message: "Cannot delete policy that has been assigned to members",
      });
    }

    await db
      .update(leave)
      .set({ status: "DISABLED" })
      .where(and(eq(leave.id, input.id), eq(leave.organizationId, context.organization.id)));
  });
