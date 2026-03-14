---
name: backend-developer
description: Implement and update oRPC backend APIs in this organization and HR SvelteKit monorepo using Better Auth, Drizzle ORM, `@repo/auth_db`, and `@repo/db`. Use when tasks ask to add or modify handlers under `apps/website/src/lib/server/orpc/handlers` or `apps/dashboard/src/lib/server/orpc/handlers`, register procedures in either router, compose middleware in either `base.ts`, inspect schemas and relations in `packages/auth_db/src` or `packages/db/src`, or build organization, member, invitation, attendance, leave, calendar, image, or auth-adjacent APIs and pagination flows.
---

# Backend Developer

## Overview

Implement backend API handlers with oRPC in the current monorepo structure. Follow existing project conventions for authentication, authorization, pagination, router registration, and the parallel `website` and `dashboard` app trees.

## Workflow

1. Identify which app tree owns the behavior.
   - `apps/website`: user-facing site and self-service flows
   - `apps/dashboard`: organization dashboard and admin flows
   - If the backend behavior is intentionally shared, inspect the corresponding file in the other app before editing.
2. Identify which data layer owns the feature.
   - Use `@repo/auth_db` and `$lib/server/auth_db.ts` for auth, session, organization membership, and middleware lookups.
   - Use `@repo/db` and `$lib/server/db.ts` for organization-domain data such as members, invitations, attendance, calendars, leave, and images.
3. Read entry points and relations before writing queries.
   - Read the target app's `src/lib/server/orpc/base.ts` and `router.ts`.
   - Read `packages/auth_db/src/index.ts` and `packages/auth_db/src/schema/relations.ts`.
   - Read `packages/db/src/index.ts` and `packages/db/src/schema/relations.ts`.
4. Create or update the handler in the target app under `src/lib/server/orpc/handlers/<domain>/<action>.ts`.
5. Define Zod input and route semantics.
   - Add `.route({ method: "GET" })` for read-only handlers.
   - Omit GET route for mutating handlers.
6. Apply middleware in `base.ts`.
   - Reuse `authMiddleware` and `organizationMiddleware` before creating a new guard.
   - Compose middleware with `concat(...)` when refining context or input requirements.
   - Narrow nullable or broad context types before handler execution.
7. Implement DB logic with Drizzle and relation-aware queries.
   - Follow the query style already used in the touched domain.
   - Match the existing pagination contract of that domain instead of changing pagination style mid-feature.
8. Register handlers in the target router and mirror the change to the other app if the API contract must stay aligned.
9. Run validation or type checks for the affected skill or app before finishing.

## Project Rules

- Treat `apps/website` and `apps/dashboard` as parallel server implementations, not as a single generated copy.
- Keep oRPC context and middleware context extensions explicit and typed.
- Treat `concat` as a general middleware composition tool, not only an RBAC pattern.
- Use middleware to narrow context types, for example from `session?: Session | null` to guaranteed `session`.
- `organizationMiddleware` is the default entry point for organization-scoped handlers; it resolves session, membership, role, organization, and optional org DB context.
- Return predictable API shapes for list endpoints such as `{ items, pageSize, nextCursor }`.
- Preserve the pagination style already used by the domain:
  - string cursor feeds for descending ID lists like attendance history
  - numeric offsets where current handlers already use offset pagination
- Prefer shaping response DTOs in the handler so frontend routes and tables receive the fields they actually need.

## Implementation Checklist

1. Map the feature to the correct app and database package.
2. Confirm whether the endpoint is read-only or mutating, then set route method.
3. Define input schema and middleware ordering.
4. Implement handler with the correct DB client and relation loading.
5. Register the router path in the owning app and mirror it where needed.
6. Validate type usage, pagination contract, and handler response shape.

## References

- For file map, conventions, and templates, read [references/orpc_backend_patterns.md](references/orpc_backend_patterns.md).
