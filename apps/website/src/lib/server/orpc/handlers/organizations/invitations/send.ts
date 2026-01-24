import { ORPCError } from "@orpc/server";
import { eq, invitation } from "@repo/db";
import z from "zod";
import { NO_REPLY_EMAIL } from "$env/static/private";
import { db } from "$lib/server/db";
import { transporter } from "$lib/server/email";
import { organizationMiddleware, os } from "$lib/server/orpc/base";
import { getBaseURL } from "$lib/utils";

const input = z.object({
  slug: z.string(),
  email: z.email(),
  role: z.enum(["ADMIN", "MEMBER"]),
  position: z.string(),
  attendancePolicyId: z.string().optional(),
  resend: z.boolean().default(false),
});

export const sendInvitationHandler = os
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ input, context }) => {
    const members = await db.query.member.findMany({
      where: { user: { email: input.email }, organizationId: context.organization.id },
      columns: { id: true, status: true },
    });

    if (members.at(0)?.status === "ACTIVE") {
      throw new ORPCError("FORBIDDEN", { message: "Member already exist" });
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await db.transaction(async (tx) => {
      const oldInvitation = await tx.query.invitation.findFirst({
        where: { organizationId: context.organization.id, email: input.email, status: "PENDING" },
        orderBy: { expiresAt: "desc" },
      });

      if (oldInvitation) {
        await tx
          .update(invitation)
          .set({
            ...input,
            expiresAt,
            createdAt: !input.resend ? new Date() : undefined,
          })
          .where(eq(invitation.id, oldInvitation.id));
      } else {
        await tx.insert(invitation).values({
          ...input,
          organizationId: context.organization.id,
          expiresAt,
          inviterId: context.session.user.id,
          teamId: null,
        });
      }

      const token = Bun.SHA256.hash(
        JSON.stringify({
          organizationId: context.organization.id,
          expiresAt,
          inviterId: context.session.user.id,
          role: input.role,
          position: input.position,
          attendancePolicyId: input.attendancePolicyId,
        }),
        "base64url",
      );

      const inviteLink = `${getBaseURL()}/accept-invitation/${token}`;
      await transporter.sendMail({
        from: NO_REPLY_EMAIL,
        to: input.email,
        subject: "Invitation",
        html: `Invite to an organization. Click this link: ${inviteLink}`,
      });
    });
  });
