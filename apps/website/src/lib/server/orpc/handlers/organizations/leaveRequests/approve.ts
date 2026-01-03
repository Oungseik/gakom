import { ORPCError } from "@orpc/server";
import { eq, leave, leaveBalance, leaveBalanceAdjustment, leaveRequest, member } from "@repo/db";
import { z } from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";
import { getDaysDifference, getLeaveYearNumber } from "$lib/utils";

const input = z.object({
  slug: z.string(),
  id: z.string(),
});

export const approveLeaveRequestHandler = os
  .input(input)
  .use(organizationMiddleware(["admin", "owner"]))
  .handler(async ({ context, input }) => {
    const reviewer = (
      await db
        .select({
          id: member.id,
          createdAt: member.createdAt,
        })
        .from(member)
        .where(eq(member.id, context.session.user.id))
        .limit(1)
    ).at(0);

    if (!reviewer) {
      throw new ORPCError("NOT_FOUND", { message: "Member not found." });
    }

    // Get the leave request with leave policy
    const leaveReq = (
      await db
        .select({
          id: leaveRequest.id,
          memberId: leaveRequest.memberId,
          leaveId: leaveRequest.leaveId,
          status: leaveRequest.status,
          startDate: leaveRequest.startDate,
          endDate: leaveRequest.endDate,
          organizationId: leave.organizationId,
        })
        .from(leaveRequest)
        .innerJoin(leave, eq(leaveRequest.leaveId, leave.id))
        .where(eq(leaveRequest.id, input.id))
        .limit(1)
    ).at(0);

    if (!leaveReq) {
      throw new ORPCError("NOT_FOUND", { message: "Leave request not found." });
    }

    if (leaveReq.organizationId !== context.organization.id) {
      throw new ORPCError("FORBIDDEN", {
        message: "You don't have permission to approve this request.",
      });
    }

    if (leaveReq.status !== "PENDING") {
      throw new ORPCError("BAD_REQUEST", {
        message: `Cannot approve a leave request with status ${leaveReq.status}.`,
      });
    }

    const daysApart = getDaysDifference(leaveReq.endDate, leaveReq.startDate) + 1;

    await db.transaction(async (tx) => {
      const requester = (
        await tx
          .select({
            id: member.id,
            createdAt: member.createdAt,
          })
          .from(member)
          .where(eq(member.id, leaveReq.memberId))
          .limit(1)
      ).at(0);

      if (!requester) {
        throw new ORPCError("NOT_FOUND", { message: "Requester not found." });
      }

      const leaveYearNumber = getLeaveYearNumber(requester.createdAt, leaveReq.startDate);
      const balance = await tx.query.leaveBalance.findFirst({
        where: {
          memberId: requester.id,
          leaveId: leaveReq.leaveId,
          year: leaveYearNumber,
        },
      });

      if (!balance) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Leave balance not found. Please report this bug.",
        });
      }

      // Update leave request status
      await tx
        .update(leaveRequest)
        .set({
          status: "APPROVED",
          reviewerId: reviewer.id,
          reviewedAt: new Date(),
        })
        .where(eq(leaveRequest.id, leaveReq.id));

      // Update leave balance: decrement pendingDays, increment usedDays
      await tx
        .update(leaveBalance)
        .set({
          pendingDays: balance.pendingDays - daysApart,
          usedDays: balance.usedDays + daysApart,
        })
        .where(eq(leaveBalance.id, balance.id));

      // Create balance adjustment record
      await tx.insert(leaveBalanceAdjustment).values({
        balanceId: balance.id,
        memberId: requester.id,
        leaveId: leaveReq.leaveId,
        adjustmentType: "USAGE",
        days: daysApart,
        reason: "Leave request approved",
        requestId: leaveReq.id,
        adjustedBy: reviewer.id,
      });
    });

    return { success: true };
  });
