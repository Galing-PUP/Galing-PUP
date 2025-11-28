# Galing-PUP

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)


A Next.js application for academic research paper discovery and analysis, built with Next.js 16, React 19, and shadcn/ui.


- [Galing-PUP](#galing-pup)
  - [Tech Stack](#tech-stack)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Contributing](#contributing)
    - [Branch Workflow](#branch-workflow)
      - [Workflow Steps](#workflow-steps)
    - [File Naming Conventions](#file-naming-conventions)
      - [Components](#components)
      - [Pages (App Router)](#pages-app-router)
      - [Utilities \& Data](#utilities--data)
      - [Types \& Interfaces](#types--interfaces)
    - [Code Style Guidelines](#code-style-guidelines)
      - [TypeScript](#typescript)
      - [React Components](#react-components)
      - [Styling](#styling)
      - [Imports](#imports)
    - [Using Next.js MCP Server (VS Code Copilot Users)](#using-nextjs-mcp-server-vs-code-copilot-users)
    - [Adding shadcn/ui Components](#adding-shadcnui-components)
    - [Project Structure](#project-structure)
    - [Commit Message Convention](#commit-message-convention)
    - [Testing](#testing)
    - [Pull Request Guidelines](#pull-request-guidelines)
  - [Deployment](#deployment)
  - [Learn More](#learn-more)
  - [Support](#support)


## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **React:** 19.2.0
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **Icons:** [Lucide React](https://lucide.dev)
- **Type Safety:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Galing-PUP/Galing-PUP.git
   cd Galing-PUP
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing

We welcome contributions! Please follow these guidelines to maintain code quality and consistency.

### Branch Workflow

- **`main`** - Production-ready code. Deployments happen from this branch.
- **`develop`** - Integration branch for features. All feature branches merge here first.
- **Feature branches** - Create from `develop` for each new feature or fix.

#### Workflow Steps

1. **Create a feature branch** from `develop`:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-fix-name
   ```


2. **Make your changes** following the coding standards below.

>[!IMPORTANT] **Commit Message Guidelines (Conventional Commits)**  
> Use these prefixes in your commit messages to maintain consistency and clarity.

- `feat:` Add a new feature or capability  
  Example: `feat: implement search filter component`

- `fix:` Correct a bug or resolve an issue  
  Example: `fix: resolve navigation error on mobile`

- `chore:` Maintenance tasks or refactoring that does not affect functionality  
  Example: `chore: update dependencies`  

- `docs:` Documentation-only changes  
  Example: `docs: update CONTRIBUTING.md`

- `style:` Code style, formatting, or whitespace changes (no logic change)  
  Example: `style: fix indentation in utils.ts`

- `refactor:` Code restructuring without adding features or fixing bugs  
  Example: `refactor: simplify search-bar component logic`

- `test:` Add or update tests  
  Example: `test: add unit tests for login component`

3. **Commit your changes**:

   ```bash
   git add .
   git commit -m "feat: add new feature"
   # or
   git commit -m "fix: resolve issue with component"
   ```

4. **Push to your branch**:

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** to `develop` (not `main`).

6. **Testing & Merge Schedule**: Every **Wednesday**, the `develop` branch is tested and merged into `main`.

### File Naming Conventions

#### Components

- Use **kebab-case** for component files: `component-name.tsx`
- Place components in appropriate directories:

  ```plaintext
  components/
    ├── button.tsx           # Global components
    ├── header.tsx
    ├── search-bar.tsx
    └── paper/               # Feature-specific components
        ├── abstract.tsx
        ├── action-buttons.tsx
        ├── ai-insights.tsx
        └── ...
  ```

#### Pages (App Router)

- Use **lowercase** for route folders: `app/search-results/page.tsx`
- Dynamic routes use brackets: `app/paper/[id]/page.tsx`

#### Utilities & Data

- Use **camelCase** for utility files: `lib/utils.ts`
- Use **camelCase** for data files: `data/mockResults.ts`

#### Types & Interfaces

- Define types in the same file or in a dedicated `types.ts`
- Use **PascalCase** for type/interface names:

  ```typescript
  interface SearchResult {
    id: string;
    title: string;
  }
  ```

### Code Style Guidelines

#### TypeScript

- Always use TypeScript for `.tsx` and `.ts` files
- Avoid `any` types - use proper typing
- Export types/interfaces that are used across files

#### React Components

- Use **functional components** with hooks
- Use **named exports** for components:

  ```typescript
  export function ComponentName() {
    return <div>...</div>
  }
  ```

#### Styling

- Use **Tailwind CSS** classes for styling
- Leverage shadcn/ui components when available
- Use the `cn()` utility from `lib/utils.ts` for conditional classes:

  ```typescript
  import { cn } from "@/lib/utils"

  <div className={cn("base-class", isActive && "active-class")} />
  ```

#### Imports

- Use absolute imports with `@/` prefix:

  ```typescript
  import { Button } from "@/components/button"
  import { mockResults } from "@/data/mockResults"
  ```

### Using Next.js MCP Server (VS Code Copilot Users)

If you're using the Next.js DevTools MCP server with GitHub Copilot in VS Code:

⚠️ **IMPORTANT:** Run the `init` tool at the **start of every development session**:

```text
Ask Copilot: "use init tool from next devtools"
```

This ensures:

- Latest Next.js documentation is loaded
- AI assistant uses official docs instead of outdated knowledge
- Proper context for Next.js 16 features (App Router, Server Components, etc.)

### Prisma ORM & Supabase



#### Supabase (Local)

Galing-PUP application uses Supabase PostgreSQL as the backend database for CRUD operations.

**Running locally**

> [!NOTE] 
> For macOS 15 or lower If the health check fails, pass the flag `--ignore-health-check` to run anyway.

**Prerequisites:** Docker or Docker Desktop must be installed.

>[!NOTE]
> If `docker-desktop` fails to run the engine, try exporting via `export DOCKER_HOST=unix:///var/run/docker.sock`

**Start Supabase locally:** run `bunx supabase start` or `npx supabase start`

**Setup Supabase for Prisma**

#### Supabase (Web)

**1. Create a new project**
  - Go to "New Project"
  - Enter Project Name, Database Password, Region
  - Wait for the project to initialize

**2. Retrieve connection details**
 - Go to "Settings" -> "Database"
 - Copy the "Connection String" (PostgreSQL URL)
 - This URL will be used to connect Prisma or other clients

```sql
create user "prisma" with password 'galingpuplocal' bypassrls createdb;

-- Extend Prisma's privileges to Postgres (required for dashboard visibility)
grant "prisma" to "postgres";

-- Grant permissions on relevant schemas (public)
grant usage on schema public to prisma;
grant create on schema public to prisma;
grant all on all tables in schema public to prisma;
grant all on all routines in schema public to prisma;
grant all on all sequences in schema public to prisma;

alter default privileges for role postgres in schema public grant all on tables to prisma;
alter default privileges for role postgres in schema public grant all on routines to prisma;
alter default privileges for role postgres in schema public grant all on sequences to prisma;
```

**Note:** Copy the Supabase PostgreSQL URL for connecting Prisma. Supabase uses PostgreSQL as the default database.

### Prisma

Prisma is an ORM (Object-Relational Mapper) that abstracts database operations, providing high-level CRUD operations and reducing the need for raw SQL.

- Please watch the [youtube video](https://www.youtube.com/watch?v=RebA5J-rlwg) how prisma mechanics works and manages data.
- Quickstart guide on [prisma](https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres)
- Latest Changes in [Prisma 7](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7) as of November 18, 2025


#### Setup

`bunx prisma migrate` or `npx prisma migrate`

####  Migrating

Creates a SQL migration file for rollback to older version in case of errors

`bunx prisma migrate dev` or `npx prisma migrate dev`

#### Seeding 

Populate the database for testing

`bunx prisma db seed` or `npx prisma db seed`



### Adding shadcn/ui Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
# etc.
```

Components will be added to the `components/` directory and can be customized as needed.

### Project Structure

```plaintext
Galing-PUP/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── paper/[id]/        # Dynamic paper detail page
│   ├── pricing/           # Pricing page
│   ├── search-results/    # Search results page
│   ├── signin/            # Sign-in page
│   └── ...
├── components/            # React components
│   ├── button.tsx
│   │── header.tsx
│   ├── paper/            # Feature-specific components
│   └── ...
├── lib/                   # Utilities and helpers
│   └── utils.ts
│   └── ...
├── data/                  # Mock data and constants
│   └── mockResults.ts
│   └── ...
├── public/               # Static assets
└── assets/               # Images, icons, graphics
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:

```text
feat: add search filter functionality
fix: resolve navigation issue on mobile
docs: update README with contribution guidelines
refactor: simplify search-bar component logic
```

### Testing

Before submitting a PR:

1. **Run successfully**: Run `npm run dev` to check changes and if they work as expected.
2. **Lint your code**: Run `npx eslint .` to catch any linting issues

### Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Include screenshots for UI changes
- Ensure all checks pass before requesting review
- Target the `develop` branch (not `main`)

## Deployment

- **Production deploys** happen from the `main` branch
- Merges to `main` occur every **Wednesday** after testing `develop`
- Deployment platform: [Vercel](https://vercel.com)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [shadcn/ui Documentation](https://ui.shadcn.com) - UI component library
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility-first CSS framework

## Support

For questions or issues, please open an issue on GitHub.
