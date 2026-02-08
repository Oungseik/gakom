import { and, desc, eq, leave, leaveBalance, like, member } from "@repo/db";
import { ORPCError } from "@orpc/server";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  memberId: z.string().optional(),
  cursor: z.number().optional(),
  pageSize: z.number().optional().default(10),
  filter: z
    .object({
      search: z.string().optional(),
    })
    .optional(),
});

export const listLeaveBalancesHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware())
  .handler(async ({ input, context }) => {
    if (input.memberId && context.member.role === "MEMBER") {
      throw new ORPCError("FORBIDDEN", {
        message: "Not enough permission to access the leave balance of other member",
      });
    }

    const filter = input.filter;
    const targetMemberId = input.memberId ?? context.member.id;
    const limit = input.pageSize + 1;

    const items = await db
      .select({
        id: leaveBalance.id,
        memberId: leaveBalance.memberId,
        leaveId: leaveBalance.leaveId,
        leaveName: leave.name,
        totalDays: leaveBalance.totalDays,
        usedDays: leaveBalance.usedDays,
        pendingDays: leaveBalance.pendingDays,
        year: leaveBalance.year,
        createdAt: leaveBalance.createdAt,
        updatedAt: leaveBalance.updatedAt,
      })
      .from(leaveBalance)
      .innerJoin(leave, eq(leaveBalance.leaveId, leave.id))
      .innerJoin(member, eq(leaveBalance.memberId, member.id))
      .where(
        and(
          eq(leaveBalance.memberId, targetMemberId),
          filter?.search ? like(leave.name, `%${filter.search}%`) : undefined,
        ),
      )
      .orderBy(desc(leaveBalance.year), desc(leaveBalance.createdAt))
      .offset(input.cursor ?? 0)
      .limit(limit);

    let nextCursor: number | undefined;
    if (items.length > input.pageSize) {
      items.pop();
      nextCursor = (input.cursor ?? 0) + input.pageSize;
    }

    return {
      items: items.map((balance) => ({
        id: balance.id,
        memberId: balance.memberId,
        leaveId: balance.leaveId,
        name: balance.leaveName ?? "deleted leave",
        totalDays: balance.totalDays,
        usedDays: balance.usedDays + balance.pendingDays,
        year: balance.year,
        createdAt: balance.createdAt,
        updatedAt: balance.updatedAt,
      })),
      nextCursor,
      pageSize: input.pageSize,
    };
  });
