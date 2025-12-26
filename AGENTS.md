# AGENTS.md

## Project Context
**Name:** Galing-PUP
**Domain:** Academic Research Repository (CCIS Department).
**Mission:** Transition research storage from manual distribution to a centralized web platform.

**Core Functional Requirements:**
- **Search Engine:** Filter by Keyword, Topic, Author, Year, and Research Type.
- **Access Level:**
  - *Public/Student:* Read-only (PDF/Text).
  - *Admin/Faculty:* Write (Upload, Edit, Delete).
- **Data Structure:** Categorized by Subject and Publication Year.
- **Security:** Role-Based Access Control (RBAC) via Supabase Auth.
- **AI Integration:** Use Google Gemini to generate summaries of research materials automatically.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Runtime:** Bun (v1.x+)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **AI Model:** Google Gemini (via `google-generative-ai` SDK)
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Icons:** Lucide React
- **Testing:** Buntest

## Key Commands
- **Install:** `bun install`
- **Dev Server:** `bun run dev`
- **Database:**
  - Generate: `bunx prisma generate`
  - Migrate: `bunx prisma migrate dev`
  - Seed: `bunx prisma db seed`
- **Test:** `bun test`

## Directory Structure
- `app/` (Next.js App Router)
  - `(public)/`: Public facing pages (browse, paper, pricing)
  - `(auth)/`: Authentication routes (signin, verify-otp)
  - `admin/`: Protected admin dashboard
  - `api/`: Route Handlers
- `components/`: Reusable UI components (shadcn)
- `lib/`: Utility functions (Supabase client, Gemini wrapper)
- `prisma/`: Schema and seed data
- `supabase/`: Local config

## Coding Standards (Strict)
- **Routing:** Use kebab-case for folders (`app/request-access`).
- **Data Fetching:** Prefer **Server Components** over `useEffect` for initial data load.
- **Comments:** Add JSDoc to every function. Explain inputs, outputs, and what it does.
- **Imports:** Use absolute imports (`@/components/...`).
- **Type Safety:** No `any`. Define interfaces in `types/` or co-located if specific.
- **Naming:**
  - `camelCase` for variables/functions.
  - `PascalCase` for Components/Interfaces.

## Negative Constraints (DO NOT DO)
- **NO NPM/YARN:** Always use `bun` for package management.
- **NO RAW SQL:** Always use Prisma Client for database operations.
- **NO SECRETS:** Never hardcode API keys; use `process.env`.
- **NO CLASS COMPONENTS:** Use React Functional Components only.
- **NO REDUNDANT CODE:** Refactor and remove redundant code.
- **NO REDUNDANT COMMENTS:** Remove redundant comments.
- **NO MAGIC NUMBERS:** Use constants for magic numbers.
- **NO MAGIC STRINGS:** Use constants for magic strings.

## Git & Version Control
**Commit Message Convention:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Testing
- `chore:` Config/Maintenance