---
name: frontend-developer
description: Build, refactor, and debug frontend features in this SvelteKit monorepo's `apps/website` and `apps/dashboard` apps using Svelte 5 runes, `@repo/ui`, `@tanstack/svelte-form`, `zod`, `@tanstack/svelte-query`, and oRPC client helpers. Use when requests mention dashboard pages, organization/member/invitation/attendance/leave/calendar UI, auth or account flows, shared dialogs/tables/cards/forms, shadcn component installation guidance, lucide icons, or filter/search/infinite-list behavior in either app.
---

# Frontend Developer

## Overview

Build production-ready frontend UI that matches the patterns already present in the touched app.
Start from nearby code first. When an analogous feature exists in the other app, use it as a cross-check instead of inventing a new pattern.

## Workflow

1. Identify the target app, feature area, and task type: route page, feature component, shared component, or UI-only spike.
2. Read existing nearby code before editing:
   - Route files under `apps/website/src/routes` or `apps/dashboard/src/routes`
   - Local components under `apps/*/src/lib/components`
   - The analogous feature in the other app when it exists
3. Reuse existing `@repo/ui` primitives and app-local components before introducing new building blocks.
4. Implement forms with `@tanstack/svelte-form` and `zod`; implement async state with TanStack Query and `orpc`.
5. Preserve Svelte 5 rune-style patterns already used in the target area (`$state`, `$derived`, `$effect`).
6. If the backend is missing or intentionally deferred, keep mock wiring isolated and clearly marked for replacement.

## App Structure

- `apps/website/src/routes`: end-user app, including auth, invitation acceptance, self-service attendance, and leave flows.
- `apps/dashboard/src/routes`: organization dashboard, including members, invitations, calendars, policies, reports, and settings.
- `apps/*/src/lib/components`: feature components, tables, dialogs, cards, forms, and navigation used by the routes.
- `packages/ui`: shared UI primitives. Import from `@repo/ui/<component>`.

## Monorepo Conventions

- Import UI primitives from `@repo/ui/<component>` and use the exports already established in the codebase.
- Import lucide icons absolutely from `@lucide/svelte/icons/<icon-name>`.
- Keep app-local imports under `$lib/*`, `$app/*`, and route-local `./$types`.
- Use `createQuery`, `createInfiniteQuery`, `createMutation`, and `useQueryClient` with `orpc.<namespace>.<procedure>.*Options(...)`.
- When list pages already use URL-driven filters, keep `runed/kit` search-param schemas aligned with the UI rather than introducing ad hoc component state.

## Install Missing Components

Do not install components directly from this skill.

If required components are missing, stop and ask the user to run the exact commands.
Provide a concrete command list such as:
- `pnpm run shadcn button card`
- `pnpm run shadcn-extras @ieedan/shadcn-svelte-extras/password`

Continue only after the user confirms installation is complete.

## Form and Data Patterns

- Use `createForm` from `@tanstack/svelte-form` for local form state and submit flow.
- Use `zod` validators on form fields, returning the first message from parse errors.
- Use `createQuery`, `createMutation`, `createInfiniteQuery`, and `useQueryClient` from `@tanstack/svelte-query`.
- Use oRPC option helpers directly inside query factories, including `orpc.<resource>.<procedure>.infiniteOptions(...)` for paginated lists.
- Use derived values (`$derived`) to flatten query pages, compute trends, and derive display-only UI state.

See [references/patterns.md](references/patterns.md) for canonical examples pulled from the current dashboard, invitation, organization creation, and member list screens.

## Implementation Guardrails

- Prefer editing existing feature structure over introducing a new pattern.
- Check whether the same feature exists in both apps before diverging their UX or data flow.
- Keep validation messages user-readable and consistent with existing UI copy.
- Keep loading and submitting states explicit, typically with `loader-2` and disabled actions.
- Avoid speculative backend integration; ship predictable mock behavior only when the task is intentionally frontend-only.

## Done Criteria

- Updated UI follows the conventions of the touched app and does not create a parallel architecture.
- Imports follow monorepo rules (`@repo/ui`, absolute lucide paths, local `$lib` organization).
- Form, query, mutation, and search-param logic uses the current repo utilities.
- Missing component dependencies are surfaced to the user with explicit install commands instead of auto-installing.
- Any temporary mock wiring is clearly identified for future API replacement.
