import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { attendance, attendancePolicy } from "./schema/attendance";
import { account, session, twoFactor, user, verification } from "./schema/core";
import { image } from "./schema/image";
import { leave, leaveBalance, leaveBalanceAdjustment, leaveRequest } from "./schema/leave";
import { invitation, member, organization, team, teamMember } from "./schema/organization";
import { relations } from "./schema/relations";

export function connect(url: string) {
  const client = new Database(url);
  return drizzle({
    client,
    schema: {
      user,
      session,
      account,
      verification,
      twoFactor,
      invitation,
      member,
      organization,
      image,
      team,
      teamMember,
      attendancePolicy,
      attendance,
      leaveRequest,
      leave,
      leaveBalance,
      leaveBalanceAdjustment,
    },
    relations,
  });
}

export * from "drizzle-orm";
export { alias } from "drizzle-orm/sqlite-core";
export * from "./schema/attendance";
export * from "./schema/core";
export * from "./schema/image";
export * from "./schema/leave";
export * from "./schema/organization";
export * from "./schema/relations";
