import { defineRelations } from "drizzle-orm";
import { attendance, attendancePolicy } from "./attendance";
import { account, session, twoFactor, user } from "./core";
import { image } from "./image";
import { leave, leaveBalance, leaveBalanceAdjustment, leaveRequest } from "./leave";
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
    leaveBalance,
    leaveBalanceAdjustment,
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
      leave: r.many.leave(),
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
      leaveBalance: r.one.leaveBalance({ from: r.member.id, to: r.leaveBalance.memberId }),
      leaveBalanceAdjustments: r.many.leaveBalanceAdjustment(),
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
      leaveBalances: r.many.leaveBalance(),
      leaveBalanceAdjustments: r.many.leaveBalanceAdjustment(),
    },
    leaveRequest: {
      leave: r.one.leave({ from: r.leaveRequest.leaveId, to: r.leave.id }),
      member: r.one.member({ from: r.leaveRequest.memberId, to: r.member.id }),
      reviewer: r.one.member({ from: r.leaveRequest.reviewerId, to: r.member.id }),
      leaveBalanceAdjustment: r.one.leaveBalanceAdjustment({
        from: r.leaveRequest.id,
        to: r.leaveBalanceAdjustment.requestId,
      }),
    },
    leaveBalance: {
      member: r.one.member({ from: r.leaveBalance.memberId, to: r.member.id }),
      leave: r.one.leave({ from: r.leaveBalance.leaveId, to: r.leave.id }),
      leaveBalanceAdjustments: r.many.leaveBalance(),
    },
    leaveBalanceAdjustment: {
      balance: r.one.leaveBalance({
        from: r.leaveBalanceAdjustment.balanceId,
        to: r.leaveBalance.id,
      }),
      member: r.one.member({ from: r.leaveBalanceAdjustment.memberId, to: r.member.id }),
      leave: r.one.leave({ from: r.leaveBalanceAdjustment.leaveId, to: r.leave.id }),
      request: r.one.leaveRequest({
        from: r.leaveBalanceAdjustment.requestId,
        to: r.leaveRequest.id,
      }),
    },
  }),
);
