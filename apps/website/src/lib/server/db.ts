import { connect } from "@repo/db";
import { DATABASE_URL } from "$env/static/private";

let _db: ReturnType<typeof connect> | undefined;

function initialize() {
  if (!_db) {
    _db = connect(DATABASE_URL);
  }
  return _db;
}

export const db = initialize();
