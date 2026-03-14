# oRPC Backend Patterns

## File Map

- Website oRPC base and middleware: `apps/website/src/lib/server/orpc/base.ts`
- Website oRPC router: `apps/website/src/lib/server/orpc/router.ts`
- Dashboard oRPC base and middleware: `apps/dashboard/src/lib/server/orpc/base.ts`
- Dashboard oRPC router: `apps/dashboard/src/lib/server/orpc/router.ts`
- Website handler examples:
  - `apps/website/src/lib/server/orpc/handlers/attendances/list.ts`
  - `apps/website/src/lib/server/orpc/handlers/members/list.ts`
  - `apps/website/src/lib/server/orpc/handlers/invitations/send.ts`
  - `apps/website/src/lib/server/orpc/handlers/organizations/create.ts`
- Auth DB entrypoint: `packages/auth_db/src/index.ts`
- Auth DB relations: `packages/auth_db/src/schema/relations.ts`
- Org domain DB entrypoint: `packages/db/src/index.ts`
- Org domain DB relations: `packages/db/src/schema/relations.ts`

## Handler Template (Read-only)

Use GET for data retrieval handlers.

```ts
import { z } from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({ slug: z.string(), cursor: z.string().optional(), pageSize: z.number() });

export const listSomethingHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware())
  .handler(async ({ input, context }) => {
    const items = await db.query.someTable.findMany({
      where: {
        organizationId: context.organization.id,
        id: { lte: input.cursor },
      },
      orderBy: { id: "desc" },
      limit: input.pageSize + 1,
    });

    let nextCursor: string | undefined;
    if (items.length > input.pageSize) {
      const next = items.pop();
      nextCursor = next?.id;
    }

    return { items, pageSize: input.pageSize, nextCursor };
  });
```

## Handler Template (Mutation)

```ts
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  name: z.string().min(1),
});

export const createSomethingHandler = os
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ input, context }) => {
    const inserted = await db
      .insert(table)
      .values({ name: input.name, organizationId: context.organization.id })
      .returning();
    const created = inserted.at(0);
    if (!created) {
      throw new ORPCError("INTERNAL_SERVER_ERROR");
    }
    return created;
  });
```

## Middleware Composition and Type Narrowing

Use `concat` for any middleware composition, not only RBAC.

Define base middleware in `base.ts`, then compose for specific requirements:

```ts
import { ORPCError } from "@orpc/server";
import { authDb } from "$lib/server/auth_db";
import { authMiddleware } from "$lib/server/orpc/base";

export const organizationScopeMiddleware = authMiddleware.concat(
  async ({ context, next }, input: { slug: string }) => {
    const member = await authDb.query.member.findFirst({
      where: {
        userId: context.session.user.id,
        organization: { slug: input.slug },
        leftAt: { isNull: true },
      },
      with: { organization: true },
    });

    if (!member?.organization) {
      throw new ORPCError("FORBIDDEN");
    }

    return next({ context: { ...context, organization: member.organization } });
  }
);
```

Common use cases for `concat`:
- auth -> organization scope
- auth -> feature flag guard
- auth -> rate limit guard
- auth -> RBAC/permission guard
- validation guard -> domain preconditions

## Router Registration Pattern

```ts
import { listMembersHandler } from "./handlers/members/list";

export const router = os.router({
  members: {
    list: listMembersHandler,
  },
});
```

## Pagination Rule

- Keep the pagination contract already used by the touched domain.
- For cursor lists, fetch `pageSize + 1`, trim the extra row, and expose `nextCursor`.
- For offset lists, increment the offset by `pageSize` only when more rows remain.
- Do not switch a stable endpoint between cursor and offset pagination unless the task explicitly requires an API contract change.
