import { os as base, ORPCError } from "@orpc/server";
import { eq, member, organization } from "@repo/db";
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
export const organizationMiddleware = (roles: string[] = ["owner", "admin", "member"]) =>
  authMiddleware.concat(async ({ context, next }, input: { slug: string }) => {
    const organizations = await db
      .select({
        id: organization.id,
        slug: organization.slug,
        role: member.role,
        memberId: member.id,
        attendancePolicyId: member.attendancePolicyId,
      })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(eq(member.userId, context.session.user.id));

    const result = organizations?.find((o) => o.slug === input.slug);
    if (!result || !roles.includes(result.role)) {
      throw new ORPCError("FORBIDDEN");
    }

    if (!result.attendancePolicyId) {
      throw new ORPCError("INTERNAL_SERVER_ERROR");
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
