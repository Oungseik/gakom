import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { account, member, organization, session, twoFactor, user, verification } from "./schema";
import { image } from "./schema/image";
import { relations } from "./schema/relations";

const schema = {
  user,
  session,
  account,
  verification,
  twoFactor,
  member,
  organization,
  image,
};

export const connectDbRemote = (url: string, authToken: string) => {
  const client = createClient({ url, authToken });
  return drizzle({ client, schema, relations });
};

export * from "drizzle-orm";
export { alias } from "drizzle-orm/sqlite-core";
export * from "./schema";
export * from "./schema/relations";
