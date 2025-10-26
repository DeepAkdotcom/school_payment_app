# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Sri Sudha Vidyaniketan Fee Management System - A full-stack TypeScript application for managing student enrollments, fee structures, and payment tracking with real-time balance calculation. Built with Express.js backend and React frontend.

**Important Context**: Despite the project directory name "VocabFeast", this is actually a fee management system for Sri Sudha Vidyaniketan educational institution. The replit.md file contains the authoritative project description.

## Common Development Commands

### Development
```powershell
npm run dev        # Start development server with hot reload (port 8080 by default)
```

### Type Checking
```powershell
npm run check      # Run TypeScript type checking without emitting files
```

### Database Operations
```powershell
npm run db:push    # Push Drizzle schema changes to PostgreSQL database
```

### Build & Production
```powershell
npm run build      # Build both client (Vite) and server (esbuild)
npm start          # Start production server (requires build first)
```

**Note**: There are no test scripts currently configured. When testing is implemented, verify test framework and approach by checking package.json and looking for test files.

## Architecture Overview

### Monorepo Structure
- **`/client`** - React frontend (Vite + TypeScript)
- **`/server`** - Express.js backend (4 core files)
- **`/shared`** - Shared type definitions and Zod schemas
- **`/attached_assets`** - Static assets accessible via `@assets` alias

### Key Architectural Patterns

**Type Safety Through Shared Schemas**:
- All data models defined in `/shared/schema.ts` using Drizzle ORM
- Zod validation schemas auto-generated with `drizzle-zod`
- Same schemas used for both client and server validation
- Prevents type drift between frontend and backend

**Storage Abstraction Layer**:
- `IStorage` interface in `server/storage.ts` defines all data operations
- Current implementation: `MemStorage` (in-memory)
- Future-ready for PostgreSQL migration (schema already defined)
- Balance calculation happens at application layer, not in storage

**State Management Pattern**:
- TanStack Query (React Query) for all server state
- Configuration: `staleTime: Infinity` (manual invalidation only)
- No refetch on window focus or intervals
- Query keys follow REST pattern: `["/api/students"]`, `["/api/payments"]`

### Server Architecture (`/server`)

**Core Files**:
1. **`index.ts`** - Express app setup, middleware, error handling, logging
2. **`routes.ts`** - All API endpoint definitions
3. **`storage.ts`** - Data persistence abstraction (`IStorage` interface, `MemStorage` class)
4. **`vite.ts`** - Development/production static file serving

**Request Logging**: Custom middleware logs API calls with method, path, status, duration, and truncated response

**Balance Calculation Logic**:
- Total Fees = `student.totalFee + student.booksFee + student.examFee`
- Total Paid = SUM of all payment components across all student payments
- Balance = Total Fees - Total Paid
- Calculated on every query (real-time accuracy)

### Client Architecture (`/client/src`)

**Directory Structure**:
- **`/pages`** - Route components (Dashboard, Students, StudentForm, StudentDetail, Payments, NotFound)
- **`/components/ui`** - shadcn/ui library components (Radix UI primitives)
- **`/components`** - Custom app components (AppSidebar, ThemeToggle)
- **`/hooks`** - Custom React hooks (use-mobile, use-toast)
- **`/lib`** - Utility modules (queryClient with custom fetch wrappers)

**Routing**: Wouter (lightweight client-side router)
- `/` → Dashboard
- `/students` → Students list
- `/students/new` → Student enrollment form
- `/students/:id` → Student detail with payment history
- `/payments` → All payments across students

**Design System** (from design_guidelines.md):
- Typography: Inter (headings/UI), Open Sans (body)
- Color: Professional green theme (`hsl(142, 76%, 36%)`)
- Spacing: Tailwind units (2, 4, 6, 8)
- Component Library: shadcn/ui with Radix UI primitives

### Data Flow

**Creating a Student**:
1. Client submits form data validated by React Hook Form + Zod
2. POST `/api/students` with `insertStudentSchema` validation
3. Server checks for duplicate admission number
4. Storage creates student with UUID
5. React Query invalidates student cache

**Recording a Payment**:
1. Client dialog collects fee breakdown (tuition, books, exam)
2. POST `/api/payments` validates student exists
3. Storage creates payment record
4. Balance automatically recalculated on next student query
5. Receipt generated client-side from updated data

## API Endpoints

**Students**:
- `GET /api/students` - List all students with calculated balances
- `GET /api/students/:id` - Single student with balance details
- `POST /api/students` - Create student (validates unique admission number)
- `PUT /api/students/:id` - Update student information
- `DELETE /api/students/:id` - Remove student and cascade delete payments

**Payments**:
- `GET /api/students/:id/payments` - Payment history for specific student
- `GET /api/payments` - All payment transactions (sorted by date)
- `POST /api/payments` - Record new payment (validates student exists)

**All endpoints return JSON**. Errors follow format: `{ message: string }`

## TypeScript Configuration

**Path Aliases** (tsconfig.json):
- `@/*` → `./client/src/*`
- `@shared/*` → `./shared/*`
- `@assets/*` → `./attached_assets/*` (Vite only)

**Module System**: ESNext with bundler resolution
- Server uses native Node ESM (`.ts` files with `type: "module"` in package.json)
- No CommonJS - all imports must use `.js` extensions in source or rely on bundler

## Database Migration Plan

**Current State**: In-memory storage (data lost on restart)

**Migration Path** (when ready):
1. Ensure `DATABASE_URL` environment variable is set (required by drizzle.config.ts)
2. Run `npm run db:push` to create PostgreSQL tables
3. Implement `PgStorage` class implementing `IStorage` interface
4. Replace `export const storage = new MemStorage()` in server/storage.ts
5. No API changes required - abstraction layer handles the swap

**Schema Location**: `shared/schema.ts` (already PostgreSQL-compatible)

## Development Patterns

**Adding a New API Endpoint**:
1. Define Zod schema in `shared/schema.ts` if needed
2. Add route handler in `server/routes.ts`
3. Implement storage method in `IStorage` interface and `MemStorage` class
4. Client queries use TanStack Query with queryKey matching URL pattern

**Adding a New Page**:
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.tsx` `<Switch>` component
3. Add navigation item to `menuItems` array in `client/src/components/app-sidebar.tsx`
4. Use existing shadcn/ui components for consistency

**Form Handling**:
- React Hook Form + Zod validation (schemas from `@shared/schema`)
- Use `@hookform/resolvers` for Zod integration
- Forms typically in dialogs or dedicated form pages

**Data Mutations**:
- Always use TanStack Query `useMutation` hook
- Manually invalidate relevant queries after success
- Toast notifications for user feedback via `useToast` hook

## Important Notes

**Validation**: All data validation happens twice - client (UX) and server (security). Always use shared Zod schemas.

**Real-time Balance**: Balance is calculated dynamically, never stored. This prevents inconsistencies but requires joining payment records on every student query.

**Academic Year**: Defaults to "2024-2025" but can be customized per student. No multi-year reporting currently implemented.

**Receipt Generation**: Client-side formatting matches official school template. Logic lives in student detail page component.

**Theme Support**: Light/dark mode toggle via `next-themes` with localStorage persistence.

## Future Enhancement Areas

From replit.md architectural review:
- **Overpayment Protection**: Warn when payment exceeds remaining balance
- **Automated Tests**: Add test coverage for balance calculations and payment mutations
- **Bulk Operations**: Import/export student data, bulk payment processing
- **Reporting**: Monthly/yearly financial reports and analytics
- **Multi-user Access**: Authentication with role-based permissions

## Windows Development Notes

This codebase is cross-platform compatible. When working in Windows PowerShell:
- Use forward slashes in code (`/api/students`) but backslashes in CLI paths
- Default port: 8080 (configurable via `PORT` environment variable)
- Build process uses `esbuild` which works identically on Windows
