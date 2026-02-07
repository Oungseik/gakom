import { ORPCError } from "@orpc/server";
import { eq, invitation, member } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { authMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  token: z.string(),
});

export const acceptInvitationHandler = os
  .use(authMiddleware)
  .input(input)
  .handler(async ({ input, context }) => {
    const existingInvitation = await db.query.invitation.findFirst({
      where: { email: context.session.user.email, teamId: { isNull: true }, status: "PENDING" },
      with: { organization: true },
      orderBy: { createdAt: "desc" },
    });

    const slug = existingInvitation?.organization?.slug;
    if (!existingInvitation || !slug) {
      throw new ORPCError("BAD_REQUEST", { message: "No invitation found" });
    }

    const { organizationId, expiresAt, inviterId, role, position, attendancePolicyId } =
      existingInvitation;

    const hash = Bun.SHA256.hash(
      JSON.stringify({
        organizationId,
        expiresAt,
        inviterId,
        role,
        position,
        attendancePolicyId: attendancePolicyId ?? undefined,
      }),
      "base64url",
    );

    if (hash !== input.token) {
      throw new ORPCError("BAD_REQUEST", { message: "Invalid token" });
    }

    const now = new Date();
    if (now > expiresAt) {
      throw new ORPCError("FORBIDDEN", { message: "Invitation already expired" });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(invitation)
        .set({ status: "ACCEPTED" })
        .where(eq(invitation.id, existingInvitation.id));

      await tx.insert(member).values({
        organizationId: existingInvitation.organizationId,
        position: existingInvitation.position,
        attendancePolicyId: existingInvitation.attendancePolicyId,
        userId: context.session.user.id,
      });
    });

    return { slug };
  });
