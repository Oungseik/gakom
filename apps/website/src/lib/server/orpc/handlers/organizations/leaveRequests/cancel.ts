import { ORPCError } from "@orpc/server";
import {
  and,
  eq,
  leave,
  leaveBalance,
  leaveBalanceAdjustment,
  leaveRequest,
  member,
} from "@repo/db";
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
  .use(organizationMiddleware())
  .handler(async ({ context, input }) => {
    /** the person who call the API */
    const canceler = (
      await db
        .select({
          id: member.id,
          createdAt: member.createdAt,
        })
        .from(member)
        .where(eq(member.id, context.session.user.id))
        .limit(1)
    ).at(0);

    if (!canceler) {
      throw new ORPCError("NOT_FOUND", { message: "Member not found." });
    }

    const leaveReq = (
      await db
        .select({
          id: leaveRequest.id,
          memberId: leaveRequest.memberId,
          status: leaveRequest.status,
          startDate: leaveRequest.startDate,
          endDate: leaveRequest.endDate,
          leaveId: leaveRequest.leaveId,
          organizationId: leave.organizationId,
        })
        .from(leaveRequest)
        .innerJoin(leave, eq(leaveRequest.leaveId, leave.id))
        .where(and(eq(leaveRequest.id, input.id), eq(leaveRequest.memberId, canceler.id)))
        .limit(1)
    ).at(0);

    if (!leaveReq) {
      throw new ORPCError("NOT_FOUND", { message: "Leave request not found." });
    }

    if (leaveReq.organizationId !== context.organization.id) {
      throw new ORPCError("FORBIDDEN", {
        message: "You don't have permission to cancel this request.",
      });
    }

    const cancellable = checkCancellable(leaveReq);
    if (!cancellable) {
      throw new ORPCError("BAD_REQUEST", { message: "Unable to cancel this leave request" });
    }

    const leaveYearNumber = getLeaveYearNumber(canceler.createdAt, new Date());
    const daysApart = getDaysDifference(leaveReq.endDate, leaveReq.startDate) + 1;

    await db.transaction(async (tx) => {
      const balance = await tx.query.leaveBalance.findFirst({
        where: {
          memberId: canceler.id,
          leaveId: leaveReq.leaveId,
          year: leaveYearNumber,
        },
      });

      if (!balance) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to cancel leave. Please report bug.",
        });
      }

      // Update leave balance based on current status
      if (leaveReq.status === "PENDING") {
        if (balance.pendingDays < daysApart) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Failed to cancel leave. Please report bug.",
          });
        }
        await tx
          .update(leaveBalance)
          .set({ pendingDays: balance.pendingDays - daysApart })
          .where(eq(leaveBalance.id, balance.id));
      } else if (leaveReq.status === "APPROVED") {
        if (balance.usedDays < daysApart) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Failed to cancel leave. Please report bug.",
          });
        }
        await tx
          .update(leaveBalance)
          .set({ usedDays: balance.usedDays - daysApart })
          .where(eq(leaveBalance.id, balance.id));
      }

      await tx
        .update(leaveRequest)
        .set({ status: "CANCELLED" })
        .where(eq(leaveRequest.id, leaveReq.id));

      // Create balance adjustment record
      await tx.insert(leaveBalanceAdjustment).values({
        balanceId: balance.id,
        memberId: canceler.id,
        leaveId: leaveReq.leaveId,
        adjustmentType: "ADJUSTMENT",
        days: -daysApart,
        reason: `Leave request cancelled (was ${leaveReq.status})`,
        requestId: leaveReq.id,
      });
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
