# Refactoring Implementation Plan: PlastiKart MVP

This plan outlines the steps to systematically refactor the existing codebase so that it fully adheres to the architecture, file structure, and coding standards defined in `AGENTS.md`.

## User Review Required

> [!IMPORTANT]
> **Moving out of `src/`**: The standard Next.js App Router setup defaults to using a `src/` directory, which is currently how this project is structured. However, `AGENTS.md` explicitly requires the `app/`, `components/`, and `lib/` folders to be at the project root (`plastikart/`). 
> 
> **Question**: Should we forcefully move everything out of `src/` to the root to strictly match the `AGENTS.md` spec, or should we keep the Next.js `src/` convention while fixing the internal folder structures? (This plan assumes we move everything to the root).

## Open Questions

- **UI Framework Setup**: `AGENTS.md` requires `shadcn/ui`. There are no base components in a `ui/` folder currently. Shall I initialize `shadcn/ui` and start migrating the raw HTML/Tailwind components over?
- **State Management**: React Query is mandated but currently not used. Should I install `@tanstack/react-query` and set up the providers in the root layout?

---

## Proposed Changes

### 1. File Structure Reorganization

We will flatten the project structure to match the root-level specification and categorize components correctly.

#### [NEW] `app/`
#### [NEW] `components/`
#### [NEW] `lib/`
#### [NEW] `middleware.ts`
#### [DELETE] `src/`

- Move all contents of `src/app/`, `src/components/`, and `src/lib/` to the project root.
- Update `tsconfig.json` path aliases (e.g., changing `"@/*": ["./src/*"]` to `"@/*": ["./*"]`).
- Reorganize `components/`:
  - Create `components/store/`, `components/shared/`, `components/admin/`, and `components/ui/`.
  - Move `Header.tsx`, `Logo.tsx`, `CartOverlay.tsx`, etc. into `components/shared/` or `components/store/` as appropriate.
- Reorganize `app/`:
  - Rename `app/(customer)` to `app/(store)`.
  - Move standalone routes (`products/`, `auth/`, `search/`) inside `app/(store)/`.
- Reorganize `lib/`:
  - Create `api/`, `services/`, `repositories/`, `validations/`, `hooks/`, and `utils/`.
  - Move `excel-utils.ts` to `lib/utils/excel-utils.ts`.

---

### 2. Clean Architecture & Data Layer Separation

We will remove direct database access from React components and API routes, implementing the required Repository → Service → API Route → React Query flow.

#### [NEW] `lib/repositories/user.repository.ts`
#### [NEW] `lib/repositories/product.repository.ts`
#### [NEW] `lib/services/user.service.ts`
#### [NEW] `lib/api/products.ts`
#### [NEW] `lib/supabase/admin.ts`
#### [MODIFY] `app/api/auth/me/route.ts`
#### [MODIFY] `app/(store)/products/[slug]/page.tsx`

- **Repositories**: Centralize all Supabase DB calls (e.g., fetching a product by slug, fetching user profile). Replace all `.select('*')` with explicitly defined columns. Update `.eq('is_deleted', false)` to use `.is('deleted_at', null)`.
- **Services**: Handle business logic and pass validated data to repositories.
- **Admin Client**: Create the `lib/supabase/admin.ts` client using the service-role key for backend bypasses.
- **De-duplication**: Remove duplicate user profile fetching logic from `lib/auth/helpers.ts` and `app/api/auth/me/route.ts`. Both should rely on `user.repository.ts`.
- **API Routes**: Update routes to use Zod validation and call services instead of direct Supabase DB queries.

---

### 3. State Management & Component Fixes

We will replace ad-hoc `useEffect` data fetching and custom context-based state management with React Query and standard Supabase Auth hooks.

#### [MODIFY] `lib/auth/context.tsx` (or DELETE and replace with `lib/hooks/useAuth.ts`)
#### [MODIFY] `app/(store)/products/[slug]/page.tsx`

- **React Query**: Refactor components like `ProductPage` to use a `useQuery` hook calling a frontend `lib/api/products.ts` wrapper, instead of directly querying Supabase with `useEffect`.
- **Auth State**: Deprecate the manual React Context for auth. Implement `useAuth.ts` hook strictly derived from the Supabase session as dictated by `AGENTS.md`.
- **Formatting Fixes**: Fix monetary calculations. Components must expect integer `paise` from the API and format them correctly, rather than parsing floats (`parseFloat(product.price)`). Enforce role casing (`'ADMIN'`, not `'admin'`).

---

### 4. Edge Middleware Protection

#### [NEW] `middleware.ts`

- Create Next.js edge middleware at the project root.
- Configure it to validate the Supabase session on all `/admin/*` and `/orders/*` routes, redirecting unauthenticated users to `/auth/login`.

---

## Verification Plan

### Automated/Manual Verification
- **Build Check**: Run `npm run build` or `npx tsc --noEmit` to ensure all imports and paths are correctly resolved after the folder restructuring.
- **Component Render**: Run `npm run dev` and navigate to the homepage, product details, and auth routes to verify UI components mount without breaking.
- **Data Fetching**: Verify that the product page loads data successfully through the newly established React Query -> API Route -> Service -> Repository flow.
- **Auth Flow**: Verify that `/api/auth/me` returns the correct profile without duplicate queries and that edge middleware correctly blocks unauthenticated access to protected routes.
