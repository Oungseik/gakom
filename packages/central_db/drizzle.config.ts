import "./compression.polyfill";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  verbose: true,
  schema: "./src/schema",
  out: "./migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
