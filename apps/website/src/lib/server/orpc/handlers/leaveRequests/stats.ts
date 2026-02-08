import { and, count, eq, gte, isNull, leave, leaveRequest, lte, member } from "@repo/db";
import { z } from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
});

export const getStatsHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ context }) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const totalPendingRequests = db
      .select({ count: count() })
      .from(leaveRequest)
      .innerJoin(leave, eq(leaveRequest.leaveId, leave.id))
      .innerJoin(member, eq(leaveRequest.memberId, member.id))
      .where(
        and(
          eq(leave.organizationId, context.organization.id),
          eq(leaveRequest.status, "PENDING"),
          isNull(member.leftAt),
        ),
      );

    const totalApprovedToday = db
      .select({ count: count() })
      .from(leaveRequest)
      .innerJoin(leave, eq(leaveRequest.leaveId, leave.id))
      .innerJoin(member, eq(leaveRequest.memberId, member.id))
      .where(
        and(
          eq(leave.organizationId, context.organization.id),
          eq(leaveRequest.status, "APPROVED"),
          isNull(member.leftAt),
          lte(leaveRequest.updatedAt, endOfDay),
          gte(leaveRequest.updatedAt, startOfDay),
        ),
      );

    const totalOnLeaveToday = db
      .select({ count: count() })
      .from(leaveRequest)
      .innerJoin(leave, eq(leaveRequest.leaveId, leave.id))
      .innerJoin(member, eq(leaveRequest.memberId, member.id))
      .where(
        and(
          eq(leave.organizationId, context.organization.id),
          eq(leaveRequest.status, "APPROVED"),
          isNull(member.leftAt),
          lte(leaveRequest.startDate, endOfDay),
          gte(leaveRequest.endDate, startOfDay),
        ),
      );

    const [totalPending, totalApproved, totalOnLeave] = await Promise.all([
      totalPendingRequests,
      totalApprovedToday,
      totalOnLeaveToday,
    ]);
    return {
      totalPendingRequests: totalPending.at(0)?.count ?? 0,
      totalApprovedToday: totalApproved.at(0)?.count ?? 0,
      totalOnLeaveToday: totalOnLeave.at(0)?.count ?? 0,
    };
  });
