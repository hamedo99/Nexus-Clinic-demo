# System Architecture Documentation

## Overview
The Nexus-Clinic Dashboard has been refactored from a traditional Next.js `app/` structure to a robust **Feature-Based Architecture**. This approach guarantees a strict Separation of Concerns (SOC) and creates an Enterprise-grade Architecture capable of scaling with development teams.

## Feature-Based Modules

We introduced dedicated domains within `/src/features/` instead of scattering logic in React views and global `lib/actions`. The key features introduced:

1. **Patients Feature (**`/src/features/patients/`**)**
   - **`schemas.ts`**: Implements Zod validation rules (Phone format enforcement `07xxxxxxxxx`, Name length minimums).
   - **`services.ts`**: Pure data-layer logic accessing Prisma, abstracting DB dependencies from routing logic.
   - **`actions.ts`**: Form and server action handlers that wrap services safely with Zod checking.

2. **Appointments Feature (**`/src/features/appointments/`**)**
   - Handles the complex states of appointments with Zod parsing specific ENUM variants (CONFIRMED, CANCELLED, etc.).
   - Protects against malicious form modification on scheduling/rescheduling.

3. **Settings Feature (**`/src/features/settings/`**)**
   - Protects critical mutating actions (e.g. blocking days, reconfiguring schedules).
   - Provides fully fallback-safe schemas for partial updates to doctor clinic configurations.

## CRUD Consistency & Optimistic UI
- **Unified Actions**: Replaced disjointed try/catch error patterns in React with standardized Zod responses returning consistent `{ success: boolean, error?: string, message?: string }` objects.
- **Client Mutators**: Updated the `useCachedData` pipeline in `patients-client.tsx` to explicitly utilize `mutate()` closures, immediately flushing local data arrays while the background network requests validate and append true DB IDs. This ensures true 0-millisecond **Optimistic UI**.

## Theming & Security
- **Type Safety**: Enforced stricter validation rules in the entire Server Action boundary using `zod`.
- **Global Theme Support**: The UI integrates better with `shadcn/ui` since component prop-drilling connects cleanly to validated data output from strict TypeScript models.
