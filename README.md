# CV Builder

Frontend application for managing employees, profiles, skills, languages, and CVs with preview and PDF export.

## Features

- **Authentication** — registration, login, email verification (OTP), password recovery and reset
- **Employees** — user catalog with search, sorting, and pagination; view and edit profiles
- **Profile** — name, department, position, avatar; resend email verification code
- **Skills and languages** — manage the current user’s skills and languages with proficiency levels
- **CVs** — create, edit, and delete resumes; CV skills and projects; preview and PDF export
- **Settings** — theme (light / dark / system), UI language, password change
- **Internationalization** — en, fr, de, it, pl, pt, ru, es, uk

> The app is desktop-oriented (viewport width ≥ 768px). A GraphQL backend is required.

## Dependencies

### Runtime

| Package                                      | Purpose                       |
| -------------------------------------------- | ----------------------------- |
| `next`                                       | React framework (App Router)  |
| `react`, `react-dom`                         | UI                            |
| `@apollo/client`, `graphql`                  | GraphQL client and API access |
| `zustand`                                    | Client state (session, etc.)  |
| `i18next`, `react-i18next`                   | Localization                  |
| `@tanstack/react-table`                      | Tables                        |
| `@base-ui/react`, `shadcn`, `lucide-react`   | UI components and icons       |
| `class-variance-authority`, `tw-animate-css` | Style variants and animations |
| `rxjs`                                       | Reactive streams              |
| `tailwindcss`                                | Styling                       |

### Dev

| Package                                                                              | Purpose                 |
| ------------------------------------------------------------------------------------ | ----------------------- |
| `typescript`                                                                         | Typing                  |
| `vitest`, `@vitest/coverage-v8`, `jsdom`                                             | Unit tests and coverage |
| `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` | UI testing              |
| `@playwright/test`                                                                   | E2E tests               |
| `eslint`, `eslint-config-next`, `prettier`                                           | Linting and formatting  |
| `husky`, `lint-staged`                                                               | Git hooks               |

Package manager: **pnpm** (`pnpm@12.10.1`).

## Getting started

### Requirements

- Node.js 20+
- pnpm 12+
- Running GraphQL backend (default `http://localhost:3001/api/graphql`)

### Environment variables

Create a `.env.local` file if needed:

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/api/graphql
```

### Install and run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build

```bash
pnpm build
pnpm start
```

## Unit tests

Unit tests use **Vitest** and Testing Library.

```bash
# interactive watch mode
pnpm test

# single run with coverage report
pnpm test:coverage
```
