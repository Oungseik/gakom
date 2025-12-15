import { Database } from "@tursodatabase/database";
import { drizzle } from "drizzle-orm/tursodatabase/database";
import { account, session, twoFactor, user, verification } from "./schema/core";
import { image } from "./schema/image";
import { invitation, member, organization } from "./schema/organization";
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
    },
    relations,
  });
}

export { account, session, user, verification, twoFactor, invitation, member, organization, image };

export * from "drizzle-orm";
