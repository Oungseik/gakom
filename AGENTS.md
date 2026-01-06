# AGENTS.md - LLM Coding Guide for GAKOM

This document provides comprehensive guidance for AI assistants working on the GAKOM project. GAKOM is an Organization and HR Management software built as a modern SvelteKit monorepo.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture & Directory Structure](#architecture--directory-structure)
4. [Code Patterns](#code-patterns)
   - [oRPC API Handlers](#orpc-api-handlers)
   - [Middleware Pattern](#middleware-pattern)
   - [Svelte 5 + TanStack Query](#svelte-5--tanstack-query)
   - [Table Components](#table-components)
5. [Database Schema](#database-schema)
6. [Authentication & Authorization](#authentication--authorization)
7. [Coding Conventions](#coding-conventions)
8. [Common Tasks](#common-tasks)
9. [Testing Strategy](#testing-strategy)
10. [Environment Variables](#environment-variables)
11. [Available Commands](#available-commands)

---

## Project Overview

**GAKOM** is an Organization and HR Management software featuring:
- Multi-organization support with role-based access (owner, admin, member)
- Attendance tracking and management
- Leave management system (requests, balances, policies)
- Member invitation system
- CV/Resume management

**Application Structure:**
- `(auth)/` - Public authentication pages (signin, signup, forgot-password)
- `(private)/` - Protected routes requiring authentication
- `(private)/dashboard/[slug]/` - Organization-specific dashboard pages

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | SvelteKit 2.x + Svelte 5 (Runes) |
| **Language** | TypeScript 5.x |
| **Runtime** | Bun |
| **Database** | SQLite + Drizzle ORM + Turso |
| **Auth** | Better-Auth |
| **API Layer** | oRPC (typed RPC) |
| **State Management** | TanStack Query 6.x, runed/kit, Svelte 5 Runes |
| **Forms** | TanStack Forms + Zod |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | shadcn-svelte, shadcn-svelte-extras |
| **Icons** | Lucide Svelte |
| **i18n** | @inlang/paraglide-js |
| **Package Manager** | PNPM v10 |
| **Build System** | Turbo v2 |
| **Code Quality** | Biome, Prettier, ESLint |
| **Testing** | Vitest (unit), Playwright (E2E) |

---

## Architecture & Directory Structure

```
gakom/
├── apps/
│   ├── website/                  # Main SvelteKit application
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── components/   # Shared components
│   │   │   │   │   ├── tables/   # TanStack Table components
│   │   │   │   │   ├── dialogs/  # Dialog components
│   │   │   │   │   ├── forms/    # Form components
│   │   │   │   │   ├── headers/  # Header components
│   │   │   │   │   └── sidebar/  # Sidebar components
│   │   │   │   ├── server/       # Server-only code
│   │   │   │   │   ├── orpc/     # oRPC handlers
│   │   │   │   │   │   ├── base.ts
│   │   │   │   │   │   ├── router.ts
│   │   │   │   │   │   └── handlers/
│   │   │   │   │   │       └── organizations/
│   │   │   │   │   │           ├── members/
│   │   │   │   │   │           ├── leaveRequests/
│   │   │   │   │   │           ├── attendences/
│   │   │   │   │   │           └── attendancePolicies/
│   │   │   │   │   └── db.ts
│   │   │   │   ├── auth.ts       # Better-Auth config
│   │   │   │   ├── orpc_client.ts
│   │   │   │   └── utils/
│   │   │   ├── routes/
│   │   │   │   ├── (auth)/       # Auth pages
│   │   │   │   ├── (private)/    # Protected pages
│   │   │   │   ├── rpc/          # oRPC HTTP handler
│   │   │   │   └── +layout.svelte
│   │   │   ├── hooks.server.ts   # Server hooks
│   │   │   └── app.css           # Global styles
│   │   └── package.json
│   └── website-tests/            # Playwright E2E tests
├── packages/
│   ├── ui/                       # Shared UI components library
│   │   ├── src/lib/components/ui/  # shadcn-svelte components
│   │   └── package.json
│   └── db/                       # Database schema & config
│       ├── src/
│       │   ├── schema/           # Drizzle schemas
│       │   │   ├── core.ts       # User, session, account tables
│       │   │   ├── organization.ts
│       │   │   ├── member.ts
│       │   │   ├── leave.ts
│       │   │   ├── attendance.ts
│       │   │   ├── image.ts
│       │   │   ├── relations.ts
│       │   │   └── jwt.ts
│       │   ├── index.ts          # Exports & helpers
│       │   ├── seed.ts
│       │   ├── country.ts
│       │   └── timezone.ts
│       └── migrations/           # Drizzle migrations
│   └── package.json
├── package.json                  # Root workspace config
├── pnpm-workspace.yaml
├── turbo.json
├── biome.json
└── tsconfig.json
```

---

## Code Patterns

### oRPC API Handlers

#### Handler Structure

All API handlers follow this pattern:

```typescript
// File: src/lib/server/orpc/handlers/organizations/[feature]/[action].ts

import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";
import { and, eq, ... } from "@repo/db";
import z from "zod";

// 1. Define input schema with Zod
const input = z.object({
  slug: z.string(),           // Required: organization slug
  userId: z.string().optional(),
  filter: z.object({
    search: z.string().optional(),
    role: z.string().optional(),
  }).optional(),
});

// 2. Create handler using oRPC chain
export const listMembersHandler = os
  .route({ method: "GET" })   // or .route({ method: "POST" })
  .input(input)               // Auto-validates and types input
  .use(organizationMiddleware(["admin", "owner"]))  // Apply permission middleware
  .handler(async ({ input, context }) => {
    // 3. Handler logic
    // input is fully typed based on Zod schema
    // context contains session and organization

    // Query database
    const items = await db.select(...).from(...).where(...);

    // Return response
    return {
      items,
      nextCursor: number | undefined,
      pageSize: input.pageSize,
    };
  });
```

#### Available HTTP Methods

- `GET` - Query operations (use `.route({ method: "GET" })`)
- `POST` - Mutations (use `.route({ method: "POST" })` or omit for default POST)

#### Handler Return Types

For **queries** (infinite loading):
```typescript
return {
  items: T[],
  nextCursor: number | undefined,
  pageSize: number,
};
```

For **mutations**:
```typescript
return { success: true };  // or void
```

---

### Middleware Pattern

#### Base Middleware Chain (in `base.ts`)

```typescript
// Step 1: Auth middleware - validates session exists and email is verified
const authMiddleware = os.middleware(async ({ context, next }) => {
  if (!context.session) {
    throw new ORPCError("UNAUTHORIZED");
  }
  if (!context.session.user.emailVerified) {
    throw new ORPCError("FORBIDDEN");
  }
  return next({ context: { ...context, session } });
});

// Step 2: Organization middleware - factory pattern for role-based access
export const organizationMiddleware = (roles: string[]) =>
  authMiddleware.concat(async ({ context, next }, input: { slug: string }) => {
    // Query organization membership
    const organizations = await db.select(...).from(member)
      .innerJoin(organization, eq(...))
      .where(eq(member.userId, context.session.user.id));

    const currentOrganization = organizations.find(o => o.slug === input.slug);

    if (!currentOrganization || !roles.includes(currentOrganization.role)) {
      throw new ORPCError("FORBIDDEN");
    }

    return next({
      context: {
        ...context,
        organization: currentOrganization  // Enriched context
      }
    });
  });
```

#### Usage in Handlers

```typescript
// Require admin or owner
.use(organizationMiddleware(["admin", ".owner"]))

// Require owner only
.use(organizationMiddleware(["owner"]))

// Any authenticated user (no org check)
.use(authMiddleware)
```

#### Available Roles

- `owner` - Full organization access
- `admin` - Administrative access
- `member` - Basic member access

---

### Svelte 5 + TanStack Query

#### Creating Infinite Queries

```typescript
// Script section
import { createInfiniteQuery } from "@tanstack/svelte-query";
import { orpc } from "$lib/orpc_client";
import { useSearchParams } from "runed/kit";

const { params, data } = $props<PageProps>();
const searchParams = useSearchParams(schema);

// Query with infinite loading
const members = createInfiniteQuery(() =>
  orpc.organizations.members.list.infiniteOptions({
    enabled: searchParams.tab === "members",  // Conditional enabled
    initialPageParam: 0,
    input: (cursor) => ({
      pageSize: 10,
      cursor,
      slug: params.slug,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
);

// Derived state from query
const allMembers = $derived(
  members.data?.pages.flatMap((page) => page.items) ?? []
);

// Loading states
$derived(members.isLoading);
$derived(members.isFetchingNextPage);
$derived(members.hasNextPage);
```

#### Creating Mutations

```typescript
import { createMutation } from "@tanstack/svelte-query";

const removeMutation = createMutation(() => ({
  mutationFn: orpc.organizations.members.remove,
  onSuccess: () => {
    members.invalidate();  // Refetch after successful mutation
    toast.success("Member removed");
  },
}));

// Usage in template
<Button
  onclick={() => removeMutation.mutate({ slug: params.slug, userId })}
  disabled={removeMutation.isPending}
>
  Remove
</Button>
```

#### Svelte 5 Runes Pattern

```typescript
// Local state - use $state()
let isDialogOpen = $state(false);
let searchQuery = $state("");

// Derived state - use $derived()
const filteredItems = $derived(
  items.filter(item => item.name.includes(searchQuery))
);

// Props - use $props()
type Props = {
  data: Item[];
  onSelect: (item: Item) => void;
};
let { data, onSelect }: Props = $props();

// Effects - use $effect()
$effect(() => {
  console.log("Items changed:", filteredItems);
});

// Callbacks - use onclick (not on:click)
<Button onclick={() => handleAction()}>Action</Button>
```

---

### Table Components

#### Column Definition Pattern

```typescript
// File: src/lib/components/tables/FeatureTable/columns.ts

import type { ColumnDef } from "@tanstack/table-core";
import { renderComponent } from "@repo/ui/data-table";
import DataTableActions from "./DataTableActions.svelte";
import DataTableName from "./DataTableName.svelte";

export type FeatureItem = {
  id: string;
  name: string;
  status: string;
  createdAt: Date;
};

export const columns: ColumnDef<FeatureItem>[] = [
  {
    id: "select",
    header: ({ table }) => renderComponent(Checkbox, {
      checked: table.getIsAllPageRowsSelected(),
      onCheckedChange: (v) => table.toggleAllPageRowsSelected(v),
    }),
    cell: ({ row }) => renderComponent(Checkbox, {
      checked: row.getIsSelected(),
      onCheckedChange: (v) => row.toggleSelected(v),
    }),
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => renderComponent(DataTableName, {
      name: row.original.name,
    }),
  },
  {
    id: "actions",
    cell: ({ row }) => renderComponent(DataTableActions, {
      id: row.original.id,
      status: row.original.status,
    }),
  },
];
```

#### DataTable Component Pattern

```svelte
<!-- File: src/lib/components/tables/FeatureTable/DataTable.svelte -->
<script lang="ts" generics="TData, TValue">
  import { FlexRender, createSvelteTable } from "@repo/ui/data-table";
  import * as Table from "@repo/ui/table";
  import type { ColumnDef, RowSelectionState } from "@tanstack/table-core";

  type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
  };

  let { data, columns }: DataTableProps<TData, TValue> = $props();
  let rowSelection = $state<RowSelectionState>({});

  const table = $derived(createSvelteTable({
    get data() { return data; },
    state: {
      get rowSelection() { return rowSelection; },
    },
    columns,
    onRowSelectionChange: (updater) => {
      rowSelection = typeof updater === "function"
        ? updater(rowSelection)
        : updater;
    },
    getCoreRowModel: getCoreRowModel(),
  }));
</script>

<div class="rounded-md border">
  <Table.Root>
    <Table.Header>
      {#each table.getHeaderGroups() as headerGroup}
        <Table.Row>
          {#each headerGroup.headers as header}
            <Table.Head>
              {#if !header.isPlaceholder}
                <FlexRender
                  content={header.column.columnDef.header}
                  context={header.getContext()}
                />
              {/if}
            </Table.Head>
          {/each}
        </Table.Row>
      {/each}
    </Table.Header>
    <Table.Body>
      {#each table.getRowModel().rows as row}
        <Table.Row data-state={row.getIsSelected() && "selected"}>
          {#each row.getVisibleCells() as cell}
            <Table.Cell>
              <FlexRender
                content={cell.column.columnDef.cell}
                context={cell.getContext()}
              />
            </Table.Cell>
          {/each}
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
```

#### Using Table in Page

```svelte
<script lang="ts">
  import DataTable from "$lib/components/tables/FeatureTable/DataTable.svelte";
  import { columns } from "$lib/components/tables/FeatureTable/columns";

  let { data } = $props();
  const items = $derived(data.pages.flatMap(p => p.items));
</script>

<DataTable {columns} data={items} />

{#if hasNextPage}
  <Button onclick={() => query.fetchNextPage()}>
    Load More
  </Button>
{/if}
```

---

## Database Schema

### Core Tables (in `packages/db/src/schema/core.ts`)

```typescript
// Users table
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false).notNull(),
  image: text("image"),
  address: text("address"),
  city: text("city"),
  countryCode: text("country_code"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

// Sessions table
export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  activeOrganizationId: text("active_organization_id"),
  // ...
});

// Organizations table
export const organization = sqliteTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  // ...
});

// Members table (junction: user <-> organization)
export const member = sqliteTable("member", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  organizationId: text("organization_id").references(() => organization.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["owner", "admin", "member"] }).notNull(),
  position: text("position"),
  status: text("status", { enum: ["ACTIVE", "DEACTIVATED"] }).notNull(),
  attendancePolicyId: text("attendance_policy_id"),
  // ...
});

// Attendance & Leave tables...
```

### Key Patterns

- **Primary keys**: UUID text (`text("id").primaryKey()`)
- **Timestamps**: Milliseconds via `integer(..., { mode: "timestamp_ms" })`
- **Soft deletes**: Use `status` field with "DEACTIVATED" value
- **Relations**: Drizzle's `relations()` for implicit relations
- **Indexes**: Created via `(t) => [index(...).on(...)]`

---

## Authentication & Authorization

### Better-Auth Setup (in `src/lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/db-drizzle";
import { db } from "$lib/server/db";
import { user, session, account, verification, twoFactor } from "@repo/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    tables: { user, session, account, verification, twoFactor },
  }),
  emailAndPassword: { enabled: true },
  google: { enabled: true },
  // ... other providers
});
```

### Session Context

The session context includes:
```typescript
context.session = {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    activeOrganizationId?: string;
  };
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string;
  };
};
```

---

## Coding Conventions

### File Naming

- **Components**: `PascalCase.svelte` (e.g., `DataTable.svelte`, `Button.svelte`)
- **Handler files**: `kebab-case.ts` (e.g., `list.ts`, `create.ts`)
- **Utils**: `kebab-case.ts` or `snake_case.ts`
- **Types**: `PascalCase.ts` or `types.ts`

### Component Props

```typescript
// Always use $props() with explicit typing
type Props = {
  // Required props
  data: Item[];
  onAction: (item: Item) => void;
  // Optional props with defaults
  disabled?: boolean;
  variant?: "primary" | "secondary";
};
let { data, onAction, disabled = false, variant = "primary" }: Props = $props();
```

### Imports

```typescript
// UI components
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";

// Icons
import UserPlusIcon from "@lucide/svelte/icons/user-plus";

// Database
import { eq, and, or } from "@repo/db";

// oRPC
import { orpc } from "$lib/orpc_client";
import { organizationMiddleware, os } from "$lib/server/orpc/base";
```

### State Management

- **Local UI state**: Use `$state()` runes
- **Server data**: Use TanStack Query (`createInfiniteQuery`, `createMutation`)
- **URL search params**: Use `useSearchParams()` from `runed/kit`
- **Form state**: Use TanStack Forms with Zod validation

---

## Common Tasks

### Adding a New oRPC Handler

1. Create handler file:
   ```typescript
   // apps/website/src/lib/server/orpc/handlers/organizations/feature/action.ts
   import { organizationMiddleware, os } from "$lib/server/orpc/base";
   import { db } from "$lib/server/db";
   import z from "zod";

   const input = z.object({
     slug: z.string(),
     // ... other fields
   });

   export const actionHandler = os
     .route({ method: "POST" })  // or GET
     .input(input)
     .use(organizationMiddleware(["admin", "owner"]))
     .handler(async ({ input, context }) => {
       // Implementation
       return { success: true };
     });
   ```

2. Register in router:
   ```typescript
   // apps/website/src/lib/server/orpc/router.ts
   import { actionHandler } from "./handlers/organizations/feature/action";

   export const router = os.router({
     organizations: {
       feature: { action: actionHandler },
     },
   });
   ```

3. Use in component:
   ```typescript
   import { orpc } from "$lib/orpc_client";
   import { createMutation } from "@tanstack/svelte-query";

   const mutation = createMutation(() => ({
     mutationFn: orpc.organizations.feature.action,
   }));
   ```

### Adding a New Table Component

1. Create columns definition:
   ```typescript
   // apps/website/src/lib/components/tables/FeatureTable/columns.ts
   import type { ColumnDef } from "@tanstack/table-core";
   export type Feature = { id: string; name: string; status: string };
   export const columns: ColumnDef<Feature>[] = [...];
   ```

2. Create DataTable component:
   ```svelte
   <!-- apps/website/src/lib/components/tables/FeatureTable/DataTable.svelte -->
   <script lang="ts">
     import { createSvelteTable } from "@repo/ui/data-table";
     // ... implementation
   </script>
   ```

3. Create optional cell components:
   - `DataTableName.svelte`
   - `DataTableStatus.svelte`
   - `DataTableActions.svelte`

### Adding a New UI Component (shadcn-svelte)

```bash
# From project root
pnpm shadcn <component-name>

# Or in packages/ui directory
cd packages/ui && pnpm dlx shadcn-svelte@latest add <component-name>
```

### Database Migration

```bash
# Generate migration
pnpm db:generate

# Push schema (development)
pnpm db:push

# Run migrations (production)
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio
```

---

## Testing Strategy

### Unit Tests (Vitest)

Located in `apps/website/src/**/*.test.ts` or `**/*.spec.ts`.

```typescript
import { describe, it, expect } from "vitest";

describe("utils", () => {
  it("should format date correctly", () => {
    expect(formatDate(new Date("2024-01-01"))).toBe("Jan 1, 2024");
  });
});
```

Run: `pnpm test`

### E2E Tests (Playwright)

Located in `apps/website-tests/tests/`.

```typescript
// tests/auth/signin.spec.ts
import { test, expect } from "@playwright/test";

test("should sign in successfully", async ({ page }) => {
  await page.goto("/signin");
  await page.fill("[name=email]", "test@example.com");
  await page.fill("[name=password]", "password123");
  await page.click("button[type=submit]");
  await expect(page).toHaveURL("/dashboard");
});
```

Run: `cd apps/website-tests && pnpm test`

---

## Environment Variables

Create `.env` file from `.env.example`:

```env
# Database
DATABASE_URL="file:./databases.db"  # or Turso URL

# Auth
AUTH_SECRET="your-secret-key"
AUTH_BASE_URL="http://localhost:5173"

# OAuth (Google)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email (Nodemailer)
NO_REPLY_EMAIL=""
GOOGLE_REFRESH_TOKEN=""
SMTP_HOST=""
SMTP_PORT=""

# Storage (S3-compatible)
STORAGE_ENDPOINT=""
STORAGE_ACCESS_KEY_ID=""
STORAGE_SECRET_ACCESS_KEY=""
STORAGE_BUCKET_NAME=""
STORAGE_PUBLIC_URL=""
```

---

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start development server |
| `pnpm build` | Build all packages |
| `pnpm preview` | Preview production build |
| `pnpm check` | Run Biome checks |
| `pnpm format` | Format with Prettier |
| `pnpm lint` | Lint with ESLint |
| `pnpm test` | Run tests |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm shadcn <name>` | Add shadcn-svelte component |

---

## Key Resources

- [Svelte 5 Runes](https://svelte.dev/blog/runes)
- [oRPC Documentation](https://orpc.unnoq.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better-Auth](https://www.better-auth.com/)
- [shadcn-svelte](https://shadcn-svelte.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Biome](https://biomejs.dev/)

---

## Data Flow Architecture

### Complete Request Flow

```
Browser Request
    ↓
hooks.server.ts (rate limit → i18n → auth)
    ↓
+layout.server.ts (session + organizations data)
    ↓
+layout.svelte (UI layout with data)
    ↓
+page.server.ts (optional: page-specific data)
    ↓
+page.svelte (TanStack Query + Svelte 5)
    ↓
oRPC Handler (server-side validation)
    ↓
Database (Drizzle ORM)
```

### Server Hooks (`hooks.server.ts`)

The hooks run in sequence before any route handler:

```typescript
// apps/website/src/hooks.server.ts
import { sequence } from "@sveltejs/kit/hooks";

// 1. Rate limiting
const rateLimitHandle: Handle = async ({ event, resolve }) => {
  // Apply rate limits based on IP
};

// 2. Internationalization (Paraglide)
const handleParaglide: Handle = ({ event, resolve }) => {
  // Set locale from request
};

// 3. Authentication
const authHandle: Handle = async ({ event, resolve }) => {
  // Verify session
  // Check email verification
  // Load user organizations
  // Set locals.session and locals.organizations
};

export const handle: Handle = sequence(rateLimitHandle, handleParaglide, authHandle);
```

**Key Points:**
- Order matters: rate limit → i18n → auth
- `event.locals.session` contains user session data
- `event.locals.organizations` contains user's org memberships
- Global oRPC client is set via `globalThis.$client = client`

---

## Page Structure & Data Loading

### Root Layout Server (`(private)/+layout.server.ts`)

```typescript
// apps/website/src/routes/(private)/+layout.server.ts
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  // Redirect unauthenticated users
  if (!locals.session) {
    return redirect(303, `/signin?return_url=${url.pathname}`);
  }

  return {
    user: locals.session.user,
    session: locals.session.session,
    organizations: locals.organizations ?? [],
  };
};
```

### Dashboard Layout Server (`dashboard/[slug]/+layout.server.ts`)

```typescript
// apps/website/src/routes/(private)/dashboard/[slug]/+layout.server.ts
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ parent, params }) => {
  // Get organizations from parent (root layout)
  const { organizations } = await parent();

  // Find current organization from URL slug
  const currentOrganization = organizations?.find((o) => o.slug === params.slug);

  if (!currentOrganization) {
    return error(404); // Organization not found
  }

  return {
    currentOrganization,
    // Filter to show only admin/owner organizations in switcher
    organizations: organizations?.filter((o) => o.role !== "member"),
  };
};
```

### Page Component Pattern

```typescript
// apps/website/src/routes/(private)/dashboard/[slug]/members/+page.svelte
<script lang="ts">
  import type { PageProps } from "./$types";

  // Access data from layout server load
  const { params, data }: PageProps = $props();

  // params.slug = URL parameter
  // data.currentOrganization = Current org from layout
  // data.organizations = User's org list for switcher
</script>
```

---

## Search Params Pattern

### Defining Search Params Schema

```typescript
// apps/website/src/lib/searchParams/index.ts
import { createSearchParamsSchema } from "runed/kit";

// Simple string parameter with default
export const membersTabSchema = createSearchParamsSchema({
  tab: { type: "string", default: "members" },
});

// Optional parameter
export const returnUrlSchema = createSearchParamsSchema({
  return_url: { type: "string", default: undefined },
});
```

### Using Search Params in Components

```typescript
import { useSearchParams } from "runed/kit";
import { membersTabSchema } from "$lib/searchParams";

// Initialize with schema
const searchParams = useSearchParams(membersTabSchema);

// Read value
$derived(searchParams.tab);

// Update value (URL updates automatically)
searchParams.tab = "invitations";

// Conditional logic based on search params
const members = createInfiniteQuery(() =>
  orpc.organizations.members.list.infiniteOptions({
    enabled: searchParams.tab === "members", // Conditional fetch
  })
);
```

---

## Error Handling

### oRPC Handler Errors

```typescript
import { ORPCError } from "@orpc/server";

throw new ORPCError("UNAUTHORIZED");        // 401
throw new ORPCError("FORBIDDEN");           // 403
throw new ORPCError("NOT_FOUND");           // 404
throw new ORPCError("INPUT_VALIDATION_FAILED", { status: 422 });
throw new ORPCError("INTERNAL_SERVER_ERROR"); // 500
```

### Error Pages

Create `+error.svelte` in route groups for custom error handling:

```svelte
<!-- apps/website/src/routes/(private)/dashboard/+error.svelte -->
<script lang="ts">
  import { page } from "$app/state";
  import { Button } from "@repo/ui/button";
</script>

<div class="mx-auto min-h-dvh max-w-7xl pt-42">
  <h1 class="text-primary text-5xl font-bold">{page.status}</h1>

  {#if page.status === 403}
    <h2>Forbidden</h2>
    <p>You don't have enough permission to access this page.</p>
    <Button href="/dashboard">Back to dashboard</Button>
  {/if}

  {#if page.status === 404}
    <h2>Something's missing.</h2>
    <p>Sorry, we can't find that page.</p>
  {/if}

  {#if page.status === 500}
    <h2>Internal Server Error</h2>
    <p>We are already working to solve the problem.</p>
  {/if}
</div>
```

### Component-Level Error Handling

Use TanStack Query's error states:

```typescript
const query = createQuery({
  queryKey: ["key"],
  queryFn: fetchData,
});

// Access error
$derived(query.error);

// Display error
{#if query.isError}
  <p class="text-red-500">Error: {query.error?.message}</p>
{/if}
```

### Toast Notifications

Use `svelte-sonner` for user feedback:

```typescript
import { toast } from "svelte-sonner";

// Success toast
toast.success("Member removed successfully");

// Error toast
toast.error("Failed to remove member");

// Info toast
toast.info("Processing your request...");
```

---

## Form Handling

### Using TanStack Forms with Zod

```typescript
import { useForm } from "@tanstack/svelte-form";
import { zodValidator } from "@tanstack/svelte-form-adapter-zod";
import { z } from "zod";

// Define validation schema
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["admin", "member"]),
});

const form = useForm({
  defaultValues: {
    name: "",
    email: "",
    role: "member",
  },
  validator: zodValidator(schema),
});

// In template
<form use:form onsubmit={(e) => {
  e.preventDefault();
  form.handleSubmit();
}}>
  <input {...form.getFieldProps("name")} />
  {#if form.getFieldState("name").isTouched && form.getFieldState("name").errors.length}
    <p class="text-red-500">{form.getFieldState("name").errors[0]}</p>
  {/if}
</form>
```

### Simple Form Pattern (No Library)

```typescript
// Local form state
let name = $state("");
let email = $state("");
let isSubmitting = $state(false);

// Handle submit
async function handleSubmit() {
  isSubmitting = true;
  try {
    await mutation.mutateAsync({ name, email });
    toast.success("Created successfully");
    // Reset form
    name = "";
    email = "";
  } catch (error) {
    toast.error("Failed to create");
  } finally {
    isSubmitting = false;
  }
}
```

---

## Invitation System

### Invitation Flow

1. **Admin invites member** → Creates invitation record with token
2. **Email sent** → Contains link to `/accept-invitation/{invitationId}`
3. **User clicks link** → Page checks if user is logged in
4. **Acceptance** → Creates member record, updates invitation status

### Key Routes

```
/accept-invitation/[invitationId]     # Accept invitation page
/accept-invitation/[invitationId]/+page.server.ts  # Server load
```

### Invitation Handler Pattern

```typescript
// apps/website/src/lib/server/orpc/handlers/organizations/invitations/list.ts
export const listInvitationsHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["admin", "owner"]))
  .handler(async ({ input, context }) => {
    // Query pending invitations
    const invitations = await db.select().from(invitation)
      .where(eq(invitation.organizationId, context.organization.id));

    return { items: invitations };
  });
```

---

## Quick Reference

### Common Imports

```typescript
// Database
import { db } from "$lib/server/db";
import { eq, and, or, like, ilike, desc, asc, count } from "@repo/db";

// oRPC
import { os } from "$lib/server/orpc/base";
import { organizationMiddleware, authMiddleware } from "$lib/server/orpc/base";
import { orpc } from "$lib/orpc_client";

// Auth
import { auth } from "$lib/auth";

// State Management
import { createInfiniteQuery, createMutation } from "@tanstack/svelte-query";
import { useSearchParams } from "runed/kit";
import { page } from "$app/state";

// Forms
import { useForm } from "@tanstack/svelte-form";
import { zodValidator } from "@tanstack/svelte-form-adapter-zod";
import { z } from "zod";

// UI Feedback
import { toast } from "svelte-sonner";
```

### Svelte 5 Reactivity Quick Reference

| Pattern | Syntax | Use Case |
|---------|--------|----------|
| State | `let count = $state(0)` | Local component state |
| Derived | `const doubled = $derived(count * 2)` | Computed values |
| Props | `let { data }: Props = $props()` | Component inputs |
| Effects | `$effect(() => console.log(count))` | Side effects |
| Resources | `const data = $resource(fn)` | Async data |
| Callbacks | `onclick={() => handle()}` | Event handlers |
| Stores | `$store.value` | Reactive stores |

### Toast Notifications

```typescript
import { toast } from "svelte-sonner";

toast.success("Operation successful");
toast.error("Something went wrong");
toast.info("Processing...");
toast.warning("Please check this");
```

### ORPC Error Codes

```typescript
import { ORPCError } from "@orpc/server";

throw new ORPCError("UNAUTHORIZED");           // 401
throw new ORPCError("FORBIDDEN");              // 403
throw new ORPCError("NOT_FOUND");              // 404
throw new ORPCError("INPUT_VALIDATION_FAILED", { status: 422 });
throw new ORPCError("INTERNAL_SERVER_ERROR");  // 500
```

### Key Protected Paths

```typescript
// apps/website/src/lib/utils
export const PROTECTED_PATHS = [
  "/dashboard",
  "/app",
  "/account",
  "/accept-invitation",
];
```

