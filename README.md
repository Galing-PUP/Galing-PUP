# Galing-PUP

A Next.js application for academic research paper discovery and analysis, built with Next.js 16, React 19, and shadcn/ui.

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
