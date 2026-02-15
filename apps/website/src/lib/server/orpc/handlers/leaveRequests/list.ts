import {
  alias,
  and,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  leave,
  leaveRequest,
  like,
  lte,
  member,
  or,
  organization,
  user,
} from "@repo/db";
import { z } from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  cursor: z.number().optional(),
  pageSize: z.number(),
  slug: z.string(),
  filter: z
    .object({
      status: z.array(z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"])).optional(),
      search: z.string().optional(),
      duration: z.number().optional(),
      from: z.date().optional(),
      to: z.date().optional(),
      self: z.boolean().optional(),
    })
    .optional(),
});

export const listLeaveRequestsHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware())
  .handler(async ({ context, input }) => {
    const reviewer = alias(member, "reviewer");
    const reviewerUser = alias(user, "reviewer_user");
    const filter = input.filter;

    const items = await db
      .select({
        organizationId: organization.id,
        slug: organization.slug,
        userId: user.id,
        username: user.name,
        position: member.position,
        id: leaveRequest.id,
        memberId: leaveRequest.memberId,
        leaveId: leaveRequest.leaveId,
        name: leave.name,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        status: leaveRequest.status,
        reason: leaveRequest.reason,
        reviewerId: leaveRequest.reviewerId,
        reviewerName: reviewerUser.name,
        reviewerPosition: reviewer.position,
        reviewedAt: leaveRequest.reviewedAt,
        createdAt: leaveRequest.createdAt,
        updatedAt: leaveRequest.updatedAt,
      })
      .from(leaveRequest)
      .innerJoin(leave, eq(leaveRequest.leaveId, leave.id))
      .innerJoin(organization, eq(leave.organizationId, organization.id))
      .innerJoin(member, eq(leaveRequest.memberId, member.id))
      .innerJoin(user, eq(member.userId, user.id))
      .leftJoin(reviewer, eq(leaveRequest.reviewerId, reviewer.id))
      .leftJoin(reviewerUser, eq(reviewer.userId, reviewerUser.id))
      .where(
        and(
          eq(leave.organizationId, context.organization.id),
          isNull(member.leftAt),
          filter?.search
            ? or(like(user.name, `%${filter.search}%`), like(member.position, `%${filter.search}%`))
            : undefined,
          filter?.status?.length ? inArray(leaveRequest.status, filter.status) : undefined,
          context.member.role === "MEMBER" || filter?.self
            ? eq(leaveRequest.memberId, context.member.id)
            : undefined,
          filter?.from ? gte(leaveRequest.startDate, filter.from) : undefined,
          filter?.to ? lte(leaveRequest.endDate, filter.to) : undefined,
        ),
      )
      .orderBy(desc(leaveRequest.createdAt))
      .offset(input.cursor ?? 0)
      .limit(input.pageSize + 1);

    let nextCursor: typeof input.cursor;
    if (items.length > input.pageSize) {
      items.pop();
      nextCursor = (input.cursor ?? 0) + input.pageSize;
    }

    return {
      items,
      nextCursor,
      pageSize: input.pageSize,
    };
  });
