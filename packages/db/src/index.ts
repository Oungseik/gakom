import { Database } from "@tursodatabase/database";
import { drizzle } from "drizzle-orm/tursodatabase/database";
import { account, session, user, verification } from "./schema/core";
import { invitation, member, organization } from "./schema/organization";
import { relations } from "./schema/relations";

export function connect(url: string) {
  const client = new Database(url);
  return drizzle({
    client,
    schema: { user, session, account, verification, invitation, member, organization },
    relations,
  });
}

export { account, session, user, verification, invitation, member, organization };

