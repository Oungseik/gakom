import { ORPCError } from "@orpc/server";
import { and, eq, leaveBalance, leaveRequest, member } from "@repo/db";
import { z } from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";
import { getDaysDifference, getLeaveYearNumber } from "$lib/utils";

const input = z.object({
  slug: z.string(),
  id: z.string(),
});

export const cancelLeaveRequestHandler = os
  .input(input)
  .use(organizationMiddleware(["admin", "owner", "member"]))
  .handler(async ({ context, input }) => {
    const memberData = (
      await db
        .select({
          id: member.id,
          createdAt: member.createdAt,
        })
        .from(member)
        .where(eq(member.id, context.session.user.id))
        .limit(1)
    ).at(0);

    if (!memberData) {
      throw new ORPCError("NOT_FOUND", { message: "Member not found." });
    }

    const leaveRequestData = (
      await db
        .select({
          id: leaveRequest.id,
          memberId: leaveRequest.memberId,
          status: leaveRequest.status,
          startDate: leaveRequest.startDate,
          endDate: leaveRequest.endDate,
          leaveId: leaveRequest.leaveId,
        })
        .from(leaveRequest)
        .where(and(eq(leaveRequest.id, input.id), eq(leaveRequest.memberId, memberData.id)))
        .limit(1)
    ).at(0);

    if (!leaveRequestData) {
      throw new ORPCError("NOT_FOUND", { message: "Leave request not found." });
    }

    const cancellable = checkCancellable(leaveRequestData);
    if (!cancellable) {
      throw new ORPCError("BAD_REQUEST", { message: "Unable to cancel this leave request" });
    }

    const leaveYearNumber = getLeaveYearNumber(memberData.createdAt, new Date());
    const daysApart = getDaysDifference(leaveRequestData.endDate, leaveRequestData.startDate);

    await db.transaction(async (tx) => {
      const balance = await tx.query.leaveBalance.findFirst({
        where: {
          memberId: context.session.user.id,
          leaveId: leaveRequestData.leaveId,
          year: leaveYearNumber,
        },
      });

      if (!balance || balance.pendingDays < daysApart) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to cancel leave. Please report bug.",
        });
      }

      await tx
        .update(leaveBalance)
        .set({ pendingDays: balance.pendingDays - daysApart })
        .where(eq(leaveBalance.id, balance.id));

      await tx
        .update(leaveRequest)
        .set({ status: "CANCELLED" })
        .where(eq(leaveRequest.id, leaveRequestData.id));
    });
  });

function checkCancellable(param: {
  endDate: Date;
  status: "PENDING" | "APPROVED" | "CANCELLED" | "REJECTED";
}): boolean {
  const now = new Date().getTime();

  return (
    param.endDate.getTime() > now && !(param.status === "CANCELLED" || param.status === "REJECTED")
  );
}
