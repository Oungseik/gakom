# Frontend Patterns

Use this file as the baseline for implementation style in this repo.

## Canonical Source

- `apps/dashboard/src/lib/components/forms/AddOrganizationForm.svelte`
- `apps/website/src/lib/components/dialogs/InviteMemberDialog.svelte`
- `apps/dashboard/src/routes/[slug]/members/+page.svelte`
- `apps/website/src/routes/+page.svelte`

## Imports

- Import UI components from `@repo/ui`:
  - `import { Button } from "@repo/ui/button";`
  - `import * as Card from "@repo/ui/card";`
- Import lucide icons with absolute icon paths:
  - `import Loader2Icon from "@lucide/svelte/icons/loader-2";`
- Keep local app imports under `$lib/*` and `$app/*`.

## Form Setup with TanStack + Zod

1. Create `defaultValues`.
2. Build form via `createForm(() => ({ defaultValues, onSubmit }))`.
3. Define field validators using zod parse results, usually:
   - `z.<schema>().safeParse(value).error?.issues.at(0)?.message`
4. Prevent native submit and call `form.handleSubmit()` manually in `onsubmit`.
5. Surface `field.state.meta.errors` in UI below the field.

This pattern matches:
- `apps/dashboard/src/lib/components/forms/AddOrganizationForm.svelte`
- `apps/website/src/lib/components/dialogs/InviteMemberDialog.svelte`

## Query and Mutation Pattern

- Import from `@tanstack/svelte-query`:
  - `createQuery`
  - `createInfiniteQuery`
  - `createMutation`
  - `useQueryClient`
- Build query options from oRPC helpers, including `enabled`, paging, input mapper, and `getNextPageParam`.
- Derive transformed lists with `$derived(...)`.
- Create mutations with `createMutation(() => orpc.<feature>.<action>.mutationOptions())`.

This pattern matches:
- `apps/website/src/routes/+page.svelte`
- `apps/website/src/lib/components/dialogs/InviteMemberDialog.svelte`

## Infinite Query with ORPC

Use this pattern when the backend exposes an oRPC paginated endpoint and the UI needs a "Load more" flow.

```ts
import { createInfiniteQuery } from "@tanstack/svelte-query";

import { orpc } from "$lib/orpc_client";

const members = createInfiniteQuery(() =>
  orpc.members.list.infiniteOptions({
    initialPageParam: 0,
    input: (cursor) => ({
      pageSize: 20,
      cursor,
      slug: params.slug,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!params.slug,
  })
);

const allMembers = $derived(members.data?.pages.flatMap((page) => page.items) ?? []);
```

Follow these rules:

- Call `createInfiniteQuery(() => ...)` and return `orpc.<resource>.<procedure>.infiniteOptions(...)` directly from the factory.
- Set `initialPageParam` to the cursor type used by the procedure. In this repo that may be numeric offsets or string cursors depending on the handler.
- Pass `input` as a function of `cursor`, then merge the cursor with stable filters like `slug` and `pageSize`.
- Read the next cursor from the server response in `getNextPageParam`.
- Gate the query with `enabled` when route params or other required inputs may be unavailable on first render.
- Flatten pages with `$derived(query.data?.pages.flatMap(... ) ?? [])` before rendering lists.
- Use `query.hasNextPage` and `query.fetchNextPage()` for the "Load More" action, and `query.isFetchingNextPage` for button loading state.

This pattern matches:
- `apps/dashboard/src/routes/[slug]/members/+page.svelte`

## Search Params and Data Tables

- Use `useSearchParams(...)` from `runed/kit` when the feature already has a schema under `src/lib/searchParams`.
- Feed flattened query results into existing table components rather than duplicating row rendering in the route.
- Keep route-level code focused on query wiring, filters, and composition of headers, containers, and reusable components.

This pattern matches:
- `apps/dashboard/src/routes/[slug]/members/+page.svelte`

## Mock-Data Rule

- If backend API is unavailable, implement the full UI behavior with mock data.
- Keep mock blocks isolated and easy to replace.
- Mark replacement points with concise TODO comments.
