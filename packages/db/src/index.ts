import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { account, session, twoFactor, user, verification } from "./schema/auth";
import { image } from "./schema/image";
import { member, organization } from "./schema/organization";
import { relations } from "./schema/relations";

export const connectDb = (dbURL: string) => {
  const client = new SQL(dbURL);
  return drizzle({
    client,
    schema: {
      account,
      session,
      twoFactor,
      user,
      verification,

      image,

      member,
      organization,
    },
    relations,
  });
};

export * from "drizzle-orm";
export { alias, type PgSelect } from "drizzle-orm/pg-core";
export * from "./schema/auth";
export * from "./schema/image";
export * from "./schema/organization";
