import { defineRelations } from "drizzle-orm";
import { attendance, attendancePolicy } from "./attendance";
import { account, session, twoFactor, user } from "./core";
import { image } from "./image";
import { leave, leaveRequest } from "./leave";
import { invitation, member, organization, team, teamMember } from "./organization";

export const relations = defineRelations(
  {
    user,
    session,
    account,
    invitation,
    organization,
    member,
    team,
    teamMember,
    twoFactor,
    image,
    attendancePolicy,
    attendance,
    leave,
    leaveRequest,
  },
  (r) => ({
    user: {
      sessions: r.many.session(),
      accounts: r.many.account(),
      members: r.many.member(),
      invitations: r.many.invitation(),
      teamMembers: r.many.teamMember(),
      twoFactors: r.many.twoFactor(),
      images: r.many.image(),
      attendances: r.many.attendance(),
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
      attendancePolicies: r.many.attendancePolicy(),
      leaves: r.many.leave(),
    },
    member: {
      organization: r.one.organization({ from: r.member.organizationId, to: r.organization.id }),
      user: r.one.user({ from: r.member.userId, to: r.user.id }),
      attendancePolicy: r.one.attendancePolicy({
        from: r.member.attendancePolicyId,
        to: r.attendancePolicy.id,
      }),
      leaveRequests: r.many.leaveRequest({ from: r.member.id, to: r.leaveRequest.memberId }),
      reviewedLeaveRequests: r.many.leaveRequest({
        from: r.member.id,
        to: r.leaveRequest.reviewerId,
      }),
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
    twoFactor: {
      user: r.one.user({ from: r.twoFactor.userId, to: r.user.id }),
    },
    image: {
      user: r.one.user({ from: r.image.uploaderId, to: r.user.id }),
    },
    attendancePolicy: {
      organization: r.one.organization({
        from: r.attendancePolicy.organizationId,
        to: r.organization.id,
      }),
      members: r.many.member(),
      attendances: r.many.attendance(),
    },
    attendance: {
      user: r.one.user({ from: r.attendance.userId, to: r.user.id }),
      attendancePolicy: r.one.attendancePolicy({
        from: r.attendance.attendancePolicyId,
        to: r.attendancePolicy.id,
      }),
    },
    leave: {
      organization: r.one.organization({ from: r.leave.organizationId, to: r.organization.id }),
      leaveRequests: r.many.leaveRequest(),
    },
    leaveRequest: {
      leave: r.one.leave({ from: r.leaveRequest.leaveId, to: r.leave.id }),
      member: r.one.member({ from: r.leaveRequest.memberId, to: r.member.id }),
      reviewer: r.one.member({ from: r.leaveRequest.reviewerId, to: r.member.id }),
    },
  }),
);
