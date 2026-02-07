import { defineRelations } from "drizzle-orm";
import { attendance, attendancePolicy } from "./attendance";
import { account, session, twoFactor, user } from "./auth";
import { image } from "./image";
import { member, organization } from "./organization";

export const relations = defineRelations(
  {
    account,
    user,
    session,
    twoFactor,

    attendance,
    attendancePolicy,

    image,

    member,
    organization,
  },
  (r) => ({
    account: {
      user: r.one.user({ from: r.account.userId, to: r.user.id }),
    },
    session: {
      user: r.one.user({ from: r.session.userId, to: r.user.id }),
    },
    twoFactor: {
      user: r.one.user({ from: r.twoFactor.userId, to: r.user.id }),
    },
    user: {
      accounts: r.many.account(),
      attendances: r.many.attendance(),
      images: r.many.image(),
      members: r.many.member(),
      sessions: r.many.session(),
      twoFactors: r.many.twoFactor(),
    },

    attendance: {
      attendancePolicy: r.one.attendancePolicy({
        from: r.attendance.attendancePolicyId,
        to: r.attendancePolicy.id,
      }),
      member: r.one.member({ from: r.attendance.memberId, to: r.member.id }),
      organization: r.one.organization({
        from: r.attendance.organizationId,
        to: r.organization.id,
      }),
      user: r.one.user({ from: r.attendance.userId, to: r.user.id }),
    },
    attendancePolicy: {
      attendances: r.many.attendance(),
      members: r.many.member(),
      organization: r.one.organization({
        from: r.attendancePolicy.organizationId,
        to: r.organization.id,
      }),
    },

    image: {
      user: r.one.user({ from: r.image.uploaderId, to: r.user.id }),
    },

    member: {
      attendances: r.many.attendance(),
      attendancePolicy: r.one.attendancePolicy({
        from: r.member.attendancePolicyId,
        to: r.attendancePolicy.id,
      }),
      organization: r.one.organization({ from: r.member.organizationId, to: r.organization.id }),
      user: r.one.user({ from: r.member.userId, to: r.user.id }),
    },
    organization: {
      attendancePolicies: r.many.attendancePolicy(),
      attendances: r.many.attendance(),
      members: r.many.member(),
    },
  }),
);
