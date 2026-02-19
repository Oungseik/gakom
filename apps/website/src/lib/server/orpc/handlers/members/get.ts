import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

export const getMemberHandler = os
  .route({ method: "GET" })
  .input(
    z.object({
      slug: z.string(),
    }),
  )
  .use(organizationMiddleware(["OWNER", "ADMIN", "MEMBER"]))
  .handler(async ({ context }) => {
    const member = await db.query.member.findFirst({
      where: {
        userId: context.session.user.id,
        organization: { slug: context.organization.slug },
        leftAt: { isNull: true },
      },
      with: { user: true },
    });

    if (!member) {
      throw new Error("Member not found");
    }

    return {
      id: member.id,
      userId: member.user.id,
      name: member.user.name,
      email: member.user.email,
      image: member.user.image,
      address: member.user.address,
      city: member.user.city,
      countryCode: member.user.countryCode,
      position: member.position,
      role: member.role,
      joinedAt: member.createdAt,
      calendarId: member.calendarId,
    };
  });
