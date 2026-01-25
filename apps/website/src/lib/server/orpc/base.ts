import { os as base, ORPCError } from "@orpc/server";
import { and, eq, member, organization } from "@repo/db";
import { db } from "$lib/server/db";

type Context = {
  session?: {
    session: {
      id: string;
      userId: string;
      expiresAt: Date;
      createdAt: Date;
      updatedAt: Date;
      token: string;
      ipAddress?: string | null | undefined | undefined;
      userAgent?: string | null | undefined | undefined;
    };
    user: {
      id: string;
      email: string;
      emailVerified: boolean;
      name: string;
      createdAt: Date;
      updatedAt: Date;
      image?: string | null | undefined | undefined;
    };
  } | null;
};

export const os = base.$context<Context>().errors({
  FORBIDDEN: {},
  NOT_FOUND: {},
  INTERNAL_SERVER_ERROR: {},
  INPUT_VALIDATION_FAILED: {
    status: 422,
  },
});

export const authMiddleware = os.middleware(async ({ context, next }) => {
  const session = context.session;
  if (!session) {
    throw new ORPCError("UNAUTHORIZED");
  }

  if (!session.user.emailVerified) {
    throw new ORPCError("FORBIDDEN");
  }

  return next({ context: { ...context, session } });
});

/**
 * Middleware to protect to get the organization information for specific role
 * */
export const organizationMiddleware = (roles: string[] = ["OWNER", "ADMIN", "MEMBER"]) =>
  authMiddleware.concat(async ({ context, next }, input: { slug: string }) => {
    const organizations = await db
      .select({
        id: organization.id,
        slug: organization.slug,
        role: member.role,
        memberId: member.id,
        memberStatus: member.status,
        attendancePolicyId: member.attendancePolicyId,
      })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(and(eq(member.userId, context.session.user.id), eq(member.status, "ACTIVE")));

    const result = organizations?.find((o) => o.slug === input.slug);
    if (!result || !roles.includes(result.role.toUpperCase())) {
      throw new ORPCError("FORBIDDEN");
    }

    if (result.memberStatus === "DEACTIVATED") {
      throw new ORPCError("UNAUTHORIZED");
    }

    return next({
      context: {
        ...context,
        organization: result,
        member: { role: result.role, id: result.memberId },
        attendancePolicy: { id: result.attendancePolicyId },
      },
    });
  });
