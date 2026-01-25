---
name: full-stack-crud
description: Generate complete CRUD operations for an entity. Use for rapid prototyping.
argument-hint: \[entity]\ \[fields]\
context: fork
agent: Plan
---

Create end-to-end CRUD functionality with current project context.

## Current Project Structure
- Existing entities: !`find apps/website/src -name "*.ts" -exec grep -l "export.*sqliteTable" {} \; | head -5 || echo "No existing schemas"`
- UI patterns: !`find packages/ui/src/lib/components -name "*.svelte" | wc -l` components exist
- Auth setup: !`grep -r "BetterAuth\|session" --include="*.ts" hooks/ || echo "Auth setup not found"`
- Existing tables: !`grep -r "pgTable" --include="*.ts" packages/db/src/ | wc -l` defined

## CRUD Generation Plan

Generate:
- Database schema in `@repo/db` (!`grep -r "sqliteTable" --include="*.ts" packages/ | wc -l` tables already exist)
- ORPC handlers for create/read/update/delete under `apps/website/src/lib/server/orpc/handlers/$ENTITY/`
- Auth-protected Svelte UI routes with forms at `/admin/$ENTITY`
- Integrate all layers with type safety and error handling

## Implementation Approach
1. **Database Layer**: Define schema with $ARGUMENTS fields, relations, and Zod validation
2. **API Layer**: Create ORPC procedures for C/R/U/D operations
3. **UI Layer**: Build responsive forms with shadcn components and loading states
4. **Routing**: Setup SvelteKit routes with server-side data loading

## Conventions to Follow
- REST semantics in ORPC procedures (list, get, create, update, delete)
- Form actions for client-side updates
- Validation with Zod schemas imported from @repo/db
- Error boundaries for graceful failure handling
- Access control via session-based auth
- TypeScript throughout for safety

This skill orchestrates the multi-step implementation across all application layers for complete, production-ready CRUD operations.
