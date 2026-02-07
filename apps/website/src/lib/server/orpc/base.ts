import { os as base, ORPCError } from "@orpc/server";
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
type Roles = ("OWNER" | "ADMIN" | "MEMBER")[];
export const organizationMiddleware = (roles: Roles = ["OWNER", "ADMIN", "MEMBER"]) =>
  authMiddleware.concat(async ({ context, next }, input: { slug: string }) => {
    const member = await db.query.member.findFirst({
      where: {
        userId: context.session.user.id,
        organization: { slug: input.slug },
        leftAt: { isNull: true },
        role: { in: roles },
      },
      with: { organization: true },
    });

    if (!member?.organization) {
      throw new ORPCError("FORBIDDEN");
    }

    return next({
      context: {
        ...context,
        organization: member.organization,
        member: { role: member.role, id: member.id },
      },
    });
  });
