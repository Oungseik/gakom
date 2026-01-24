import { ORPCError } from "@orpc/server";
import { invitation } from "@repo/db";
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
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await db.transaction(async (tx) => {
      await tx
        .insert(invitation)
        .values({
          ...input,
          organizationId: context.organization.id,
          expiresAt,
          inviterId: context.session.user.id,
        })
        .onConflictDoUpdate({
          target: [invitation.organizationId, invitation.email, invitation.teamId],
          set: {
            expiresAt,
            role: input.role,
            position: input.position,
            attendancePolicyId: input.attendancePolicyId,
          },
        });

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

      const inviteLink = `${getBaseURL()}/accept-invitation?token=${token}`;
      await transporter.sendMail({
        from: NO_REPLY_EMAIL,
        to: input.email,
        subject: "Invitation",
        html: `Invite to an organization. Click this link: ${inviteLink}`,
      });
    });
  });
