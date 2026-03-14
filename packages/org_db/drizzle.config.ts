import "./compression.polyfill";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  verbose: true,
  schema: "./src/schema",
  out: "./migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.PARENT_DATABASE_URL!,
    authToken: process.env.TURSO_GROUP_AUTH_TOKEN,
  },
});
