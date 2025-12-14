import "./compression.polyfill";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema",
  out: "./migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.AUTH_DATABASE_URL!,
  },
});
