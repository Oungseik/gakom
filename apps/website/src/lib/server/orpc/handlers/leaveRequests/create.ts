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
  leaveId: z.string(),
  startDate: z.number(),
  endDate: z.number(),
  reason: z.string().optional(),
});

export const createLeaveRequestHandler = os
  .input(input)
  .use(organizationMiddleware())
  .handler(async ({ context, input }) => {
    const requester = (
      await db
        .select({
          id: member.id,
          createdAt: member.createdAt,
        })
        .from(member)
        .where(eq(member.id, context.session.user.id))
        .limit(1)
    ).at(0);

    if (!requester) {
      throw new ORPCError("NOT_FOUND", { message: "Member not found." });
    }

    // Verify the leave exists and belongs to the organization
    const leavePolicy = (
      await db
        .select({
          id: leave.id,
          organizationId: leave.organizationId,
        })
        .from(leave)
        .where(and(eq(leave.id, input.leaveId), eq(leave.organizationId, context.organization.id)))
        .limit(1)
    ).at(0);

    if (!leavePolicy) {
      throw new ORPCError("NOT_FOUND", { message: "Leave policy not found." });
    }

    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    if (startDate > endDate) {
      throw new ORPCError("BAD_REQUEST", { message: "Start date must be before end date." });
    }

    const requestedDays = getDaysDifference(endDate, startDate) + 1;
    const leaveYearNumber = getLeaveYearNumber(requester.createdAt, startDate);

    await db.transaction(async (tx) => {
      // Check leave balance
      const balance = await tx.query.leaveBalance.findFirst({
        where: {
          memberId: requester.id,
          leaveId: input.leaveId,
          year: leaveYearNumber,
        },
      });

      if (!balance) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Leave balance not found for this leave type.",
        });
      }

      const totalUsed = balance.usedDays + balance.pendingDays;
      if (totalUsed + requestedDays > balance.totalDays) {
        throw new ORPCError("BAD_REQUEST", {
          message: `Insufficient leave balance. Available: ${balance.totalDays - totalUsed} days, Requested: ${requestedDays} days.`,
        });
      }

      // Create leave request
      const [newRequest] = await tx
        .insert(leaveRequest)
        .values({
          memberId: requester.id,
          leaveId: input.leaveId,
          startDate,
          endDate,
          status: "PENDING",
          reason: input.reason,
        })
        .returning();

      // Update leave balance
      await tx
        .update(leaveBalance)
        .set({ pendingDays: balance.pendingDays + requestedDays })
        .where(eq(leaveBalance.id, balance.id));

      // Create balance adjustment record
      await tx.insert(leaveBalanceAdjustment).values({
        balanceId: balance.id,
        memberId: requester.id,
        leaveId: input.leaveId,
        adjustmentType: "USAGE",
        days: requestedDays,
        reason: `Leave request created: ${input.reason || "No reason provided"}`,
        requestId: newRequest.id,
      });
    });

    return { success: true };
  });
