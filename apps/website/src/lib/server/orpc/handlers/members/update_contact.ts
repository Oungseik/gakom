import { COUNTRY_CODES, type CountryCode } from "@repo/config";
import { eq, user } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  data: z.object({
    address: z.string().nullable(),
    city: z.string().nullable(),
    countryCode: z.enum(COUNTRY_CODES).nullable(),
  }),
});

export const updateContactHandler = os
  .input(input)
  .use(organizationMiddleware(["OWNER", "ADMIN", "MEMBER"]))
  .handler(async ({ context, input }) => {
    const memberRecord = await db.query.member.findFirst({
      where: {
        userId: context.session.user.id,
        organization: { slug: context.organization.slug },
        leftAt: { isNull: true },
      },
      with: { user: true },
    });

    if (!memberRecord) {
      throw new Error("Member not found");
    }

    await db
      .update(user)
      .set({
        address: input.data.address,
        city: input.data.city,
        countryCode: input.data.countryCode as CountryCode | null,
      })
      .where(eq(user.id, context.session.user.id));
  });
