import { Database } from "@tursodatabase/database";
import { drizzle } from "drizzle-orm/tursodatabase/database";
import { account, session, user, verification, twoFactor } from "./schema/core";
import { invitation, member, organization } from "./schema/organization";
import { relations } from "./schema/relations";

export function connect(url: string) {
  const client = new Database(url);
  return drizzle({
    client,
    schema: { user, session, account, verification, twoFactor, invitation, member, organization },
    relations,
  });
}

export { account, session, user, verification, twoFactor, invitation, member, organization };

