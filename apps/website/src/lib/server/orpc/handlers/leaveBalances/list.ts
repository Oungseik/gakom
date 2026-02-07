import { ORPCError } from "@orpc/server";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  memberId: z.string().optional(),
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

    const leaveBalances = await db.query.leaveBalance.findMany({
      where: { memberId: input.memberId ?? context.member.id },
      with: { leave: true },
    });

    return {
      balances: leaveBalances.map((balance) => ({
        name: balance.leave?.name ?? "deleted leave",
        totalDays: balance.totalDays,
        usedDays: balance.usedDays + balance.pendingDays,
      })),
    };
  });
