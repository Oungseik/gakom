import { defineRelations } from "drizzle-orm";
import { attendance, attendancePolicy } from "./attendance";
import { calendar, calendarEvent } from "./calendar";
import { account, session, twoFactor, user, verification } from "./core";
import { image } from "./image";
import { jwks } from "./jwt";
import {
  leaveBalance,
  leaveBalanceAdjustment,
  leavePolicy,
  leaveRequest,
  leaveToMember,
} from "./leave";
import { invitation, member, organization, team, teamMember } from "./organization";

export const relations = defineRelations(
  {
    user,
    session,
    account,
    verification,
    invitation,
    organization,
    member,
    team,
    teamMember,
    twoFactor,
    image,
    attendancePolicy,
    attendance,
    leavePolicy,
    leaveToMember,
    leaveRequest,
    leaveBalance,
    leaveBalanceAdjustment,
    calendar,
    calendarEvent,
    jwks,
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
      leave: r.many.leavePolicy(),
      calendars: r.many.calendar(),
    },
    member: {
      organization: r.one.organization({ from: r.member.organizationId, to: r.organization.id }),
      user: r.one.user({ from: r.member.userId, to: r.user.id, optional: false }),
      attendancePolicy: r.one.attendancePolicy({
        from: r.member.attendancePolicyId,
        to: r.attendancePolicy.id,
      }),
      calendar: r.one.calendar({ from: r.member.calendarId, to: r.calendar.id }),
      leaveRequests: r.many.leaveRequest({ from: r.member.id, to: r.leaveRequest.memberId }),
      reviewedLeaveRequests: r.many.leaveRequest({
        from: r.member.id,
        to: r.leaveRequest.reviewerId,
      }),
      leaveBalance: r.one.leaveBalance({ from: r.member.id, to: r.leaveBalance.memberId }),
      leaveBalanceAdjustments: r.many.leaveBalanceAdjustment(),
      leaveToMembers: r.many.leaveToMember(),
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
      member: r.one.member({ from: r.attendance.memberId, to: r.member.id }),
      attendancePolicy: r.one.attendancePolicy({
        from: r.attendance.attendancePolicyId,
        to: r.attendancePolicy.id,
      }),
    },
    leavePolicy: {
      organization: r.one.organization({
        from: r.leavePolicy.organizationId,
        to: r.organization.id,
      }),
      leaveRequests: r.many.leaveRequest(),
      leaveBalances: r.many.leaveBalance(),
      leaveBalanceAdjustments: r.many.leaveBalanceAdjustment(),
      leaveToMembers: r.many.leaveToMember(),
    },
    leaveRequest: {
      leave: r.one.leavePolicy({ from: r.leaveRequest.leaveId, to: r.leavePolicy.id }),
      member: r.one.member({ from: r.leaveRequest.memberId, to: r.member.id }),
      reviewer: r.one.member({ from: r.leaveRequest.reviewerId, to: r.member.id }),
      leaveBalanceAdjustment: r.one.leaveBalanceAdjustment({
        from: r.leaveRequest.id,
        to: r.leaveBalanceAdjustment.requestId,
      }),
    },
    leaveBalance: {
      member: r.one.member({ from: r.leaveBalance.memberId, to: r.member.id }),
      leave: r.one.leavePolicy({ from: r.leaveBalance.leaveId, to: r.leavePolicy.id }),
      leaveBalanceAdjustments: r.many.leaveBalanceAdjustment({
        from: r.leaveBalance.id,
        to: r.leaveBalanceAdjustment.balanceId,
      }),
    },
    leaveBalanceAdjustment: {
      balance: r.one.leaveBalance({
        from: r.leaveBalanceAdjustment.balanceId,
        to: r.leaveBalance.id,
      }),
      member: r.one.member({ from: r.leaveBalanceAdjustment.memberId, to: r.member.id }),
      leave: r.one.leavePolicy({ from: r.leaveBalanceAdjustment.leaveId, to: r.leavePolicy.id }),
      request: r.one.leaveRequest({
        from: r.leaveBalanceAdjustment.requestId,
        to: r.leaveRequest.id,
      }),
    },
    leaveToMember: {
      member: r.one.member({ from: r.leaveToMember.memberId, to: r.member.id }),
      leave: r.one.leavePolicy({ from: r.leaveToMember.leaveId, to: r.leavePolicy.id }),
    },
    calendar: {
      organization: r.one.organization({ from: r.calendar.organizationId, to: r.organization.id }),
      events: r.many.calendarEvent(),
      members: r.many.member(),
    },
    calendarEvent: {
      calendar: r.one.calendar({ from: r.calendarEvent.calendarId, to: r.calendar.id }),
    },
    verification: {},
    jwks: {},
  }),
);
