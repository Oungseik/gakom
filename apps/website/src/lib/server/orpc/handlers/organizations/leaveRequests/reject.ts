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

export const rejectLeaveRequestHandler = os
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
        message: "You don't have permission to reject this request.",
      });
    }

    // Verify the request is in PENDING or APPROVED status
    if (leaveReq.status !== "PENDING" && leaveReq.status !== "APPROVED") {
      throw new ORPCError("BAD_REQUEST", {
        message: `Cannot reject a leave request with status ${leaveReq.status}.`,
      });
    }

    const daysApart = getDaysDifference(leaveReq.endDate, leaveReq.startDate) + 1;

    await db.transaction(async (tx) => {
      // Get the member who created the request
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

      // Get leave balance
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

      await tx
        .update(leaveRequest)
        .set({
          status: "REJECTED",
          reviewerId: reviewer.id,
          reviewedAt: new Date(),
        })
        .where(eq(leaveRequest.id, leaveReq.id));

      // Update leave balance based on current status
      if (leaveReq.status === "PENDING") {
        await tx
          .update(leaveBalance)
          .set({ pendingDays: balance.pendingDays - daysApart })
          .where(eq(leaveBalance.id, balance.id));
      } else if (leaveReq.status === "APPROVED") {
        await tx
          .update(leaveBalance)
          .set({ usedDays: balance.usedDays - daysApart })
          .where(eq(leaveBalance.id, balance.id));
      }

      await tx.insert(leaveBalanceAdjustment).values({
        balanceId: balance.id,
        memberId: requester.id,
        leaveId: leaveReq.leaveId,
        adjustmentType: "ADJUSTMENT",
        days: -daysApart,
        reason: `Leave request rejected (was ${leaveReq.status})`,
        requestId: leaveReq.id,
        adjustedBy: reviewer.id,
      });
    });

    return { success: true };
  });
