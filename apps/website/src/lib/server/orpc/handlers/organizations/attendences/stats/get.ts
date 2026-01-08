import { and, attendance, count, eq, member, organization } from "@repo/db";
import { z } from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
});

export const getStatsHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["admin", "owner"]))
  .handler(async ({ context }) => {
    const today = new Date().toISOString().split("T")[0];

    const [
      totalPresentResult,
      lateArrivalsResult,
      earlyDeparturesResult,
      incompleteResult,
      todayAttendanceResult,
    ] = await Promise.all([
      db
        .select({ count: count() })
        .from(attendance)
        .innerJoin(member, eq(attendance.userId, member.userId))
        .innerJoin(organization, eq(member.organizationId, organization.id))
        .where(and(eq(organization.id, context.organization.id), eq(attendance.status, "PRESENT"))),

      db
        .select({ count: count() })
        .from(attendance)
        .innerJoin(member, eq(attendance.userId, member.userId))
        .innerJoin(organization, eq(member.organizationId, organization.id))
        .where(and(eq(organization.id, context.organization.id), eq(attendance.status, "LATE"))),

      db
        .select({ count: count() })
        .from(attendance)
        .innerJoin(member, eq(attendance.userId, member.userId))
        .innerJoin(organization, eq(member.organizationId, organization.id))
        .where(
          and(eq(organization.id, context.organization.id), eq(attendance.status, "EARLY_LEAVE")),
        ),

      db
        .select({ count: count() })
        .from(attendance)
        .innerJoin(member, eq(attendance.userId, member.userId))
        .innerJoin(organization, eq(member.organizationId, organization.id))
        .where(
          and(eq(organization.id, context.organization.id), eq(attendance.status, "INCOMPLETE")),
        ),

      db
        .select({ count: count() })
        .from(attendance)
        .innerJoin(member, eq(attendance.userId, member.userId))
        .innerJoin(organization, eq(member.organizationId, organization.id))
        .where(
          and(
            eq(organization.id, context.organization.id),
            eq(attendance.date, today),
            eq(attendance.status, "PRESENT"),
          ),
        ),
    ]);

    const totalPresent = totalPresentResult.at(0)?.count ?? 0;
    const lateArrivals = lateArrivalsResult.at(0)?.count ?? 0;
    const earlyDepartures = earlyDeparturesResult.at(0)?.count ?? 0;
    const pendingCheckouts = incompleteResult.at(0)?.count ?? 0;
    const membersPresent = todayAttendanceResult.at(0)?.count ?? 0;

    return {
      totalPresent,
      lateArrivals,
      earlyDepartures,
      membersPresent,
      pendingCheckouts,
    };
  });
