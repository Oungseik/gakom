import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { account, session, twoFactor, user, verification } from "./schema/core";
import { image } from "./schema/image";
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
    },
    relations,
  });
}

export * from "drizzle-orm";
export * from "./schema/core";
export * from "./schema/image";
export * from "./schema/organization";
export * from "./schema/relations";
