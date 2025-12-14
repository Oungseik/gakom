import { defineRelations } from "drizzle-orm";
import { account, session, user } from "./core";
import { invitation, member, organization, team, teamMember } from "./organization";

export const relations = defineRelations(
  { user, session, account, invitation, organization, member, team, teamMember },
  (r) => ({
    user: {
      sessions: r.many.session(),
      accounts: r.many.account(),
      members: r.many.member(),
      invitations: r.many.invitation(),
      teamMembers: r.many.teamMember(),
    },
    session: {
      user: r.one.user({ from: r.session.userId, to: r.user.id }),
    },
    account: {
      user: r.one.user({ from: r.account.userId, to: r.user.id }),
    },
    organization: {
      members: r.many.member(),
      invitations: r.many.invitation(),
      teams: r.many.team(),
    },
    member: {
      organization: r.one.organization({ from: r.member.organizationId, to: r.organization.id }),
      user: r.one.user({ from: r.member.userId, to: r.user.id }),
    },
    invitation: {
      organization: r.one.organization({
        from: r.invitation.organizationId,
        to: r.organization.id,
      }),
      user: r.one.user({ from: r.invitation.inviterId, to: r.user.id }),
    },
    team: {
      organization: r.one.organization({ from: r.team.organizationId, to: r.organization.id }),
      teamMembers: r.many.teamMember(),
    },
    teamMember: {
      team: r.one.team({ from: r.teamMember.teamId, to: r.team.id }),
      user: r.one.user({ from: r.teamMember.userId, to: r.user.id }),
    },
  }),
);
