import { and, count, eq, gte, isNotNull, isNull, lte, member, organization } from "@repo/db";
import { z } from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
});

export const getStatisticsHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ input }) => {
    // Calculate current and previous month date ranges
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based

    // Current month (e.g., January)
    const thisMonthStart = new Date(currentYear, currentMonth, 1);
    const thisMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    // Previous month (e.g., December)
    const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const prevMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // Total members query
    const totalMembersQuery = db
      .select({ count: count() })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(eq(organization.slug, input.slug));

    // This month's joins query
    const thisMonthJoinsQuery = db
      .select({ count: count() })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(
        and(
          eq(organization.slug, input.slug),
          lte(member.createdAt, thisMonthEnd),
          gte(member.createdAt, thisMonthStart),
        ),
      );

    // Last month's joins query
    const lastMonthJoinsQuery = db
      .select({ count: count() })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(
        and(
          eq(organization.slug, input.slug),
          lte(member.createdAt, prevMonthEnd),
          gte(member.createdAt, prevMonthStart),
        ),
      );

    // Active members query
    const activeMembersQuery = db
      .select({ count: count() })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(and(eq(organization.slug, input.slug), isNull(member.leftAt)));

    // Deactivated members query
    const deactivatedMembersQuery = db
      .select({ count: count() })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(and(eq(organization.slug, input.slug), isNotNull(member.leftAt)));

    // Execute all queries in parallel
    const [totalMembers, thisMonthJoins, lastMonthJoins, activeMembers, deactivatedMembers] =
      await Promise.all([
        totalMembersQuery,
        thisMonthJoinsQuery,
        lastMonthJoinsQuery,
        activeMembersQuery,
        deactivatedMembersQuery,
      ]);

    return {
      totalMembers: totalMembers.at(0)?.count ?? 0,
      thisMonthJoins: thisMonthJoins.at(0)?.count ?? 0,
      lastMonthJoins: lastMonthJoins.at(0)?.count ?? 0,
      activeMembers: activeMembers.at(0)?.count ?? 0,
      deactivatedMembers: deactivatedMembers.at(0)?.count ?? 0,
    };
  });
