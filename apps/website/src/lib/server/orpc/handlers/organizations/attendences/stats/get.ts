import { and, attendance, count, eq, gte, lte } from "@repo/db";
import { z } from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";
import { getYMDToday } from "$lib/utils";

const input = z.object({
  slug: z.string(),
  filter: z
    .object({
      dateFrom: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, {
          message: "Date must be in YYYY-MM-DD format",
        })
        .optional(),
      dateTo: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, {
          message: "Date must be in YYYY-MM-DD format",
        })
        .optional(),
    })
    .optional(),
});

export const getStatsHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["admin", "owner"]))
  .handler(async ({ input, context }) => {
    const filter = input.filter;
    const today = getYMDToday();

    const [totalPresentResult, lateArrivalsResult, earlyDeparturesResult, incompleteResult] =
      await Promise.all([
        db
          .select({ count: count() })
          .from(attendance)
          .where(
            and(
              eq(attendance.status, "PRESENT"),
              eq(attendance.organizationId, context.organization.id),
              gte(attendance.date, filter?.dateFrom || today),
              filter?.dateTo ? lte(attendance.date, filter.dateTo) : undefined,
            ),
          ),

        db
          .select({ count: count() })
          .from(attendance)
          .where(
            and(
              eq(attendance.status, "LATE"),
              eq(attendance.organizationId, context.organization.id),
              gte(attendance.date, filter?.dateFrom || today),
              filter?.dateTo ? lte(attendance.date, filter.dateTo) : undefined,
            ),
          ),

        db
          .select({ count: count() })
          .from(attendance)
          .where(
            and(
              eq(attendance.organizationId, context.organization.id),
              eq(attendance.status, "EARLY_LEAVE"),
              gte(attendance.date, filter?.dateFrom || today),
              filter?.dateTo ? lte(attendance.date, filter.dateTo) : undefined,
            ),
          ),

        db
          .select({ count: count() })
          .from(attendance)
          .where(
            and(
              eq(attendance.organizationId, context.organization.id),
              eq(attendance.status, "INCOMPLETE"),
              gte(attendance.date, filter?.dateFrom || today),
              filter?.dateTo ? lte(attendance.date, filter.dateTo) : undefined,
            ),
          ),
      ]);

    const totalPresent = totalPresentResult.at(0)?.count ?? 0;
    const lateArrivals = lateArrivalsResult.at(0)?.count ?? 0;
    const earlyDepartures = earlyDeparturesResult.at(0)?.count ?? 0;
    const pendingCheckouts = incompleteResult.at(0)?.count ?? 0;

    return {
      totalPresent,
      lateArrivals,
      earlyDepartures,
      pendingCheckouts,
    };
  });
