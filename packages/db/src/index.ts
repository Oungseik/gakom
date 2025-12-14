import { Database } from "@tursodatabase/database";
import {
  and,
  avg,
  count,
  DrizzleQueryError,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  like,
  lt,
  lte,
  not,
  or,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/tursodatabase/database";
import { account, session, user, verification } from "./schema/core";
import { invitation, member, organization } from "./schema/organization";
import { relations } from "./schema/relations";

let _: ReturnType<typeof connect> | undefined;

function connect() {
  const client = new Database(process.env.DATABASE_URL!);
  return drizzle({
    client,
    schema: { user, session, account, verification, invitation, member, organization },
    relations,
  });
}

function init() {
  if (!_) {
    _ = connect();
  }
  return _;
}

export const db = init();

export { account, session, user, verification, invitation, member, organization };

export {
  eq,
  not,
  and,
  or,
  lt,
  lte,
  gt,
  gte,
  like,
  ilike,
  desc,
  avg,
  count,
  inArray,
  DrizzleQueryError,
};
