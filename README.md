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

## E2E tests

E2E tests use **Playwright** and live under `tests/e2e/`.

```bash
# all browsers
pnpm test:e2e

# Chromium only
pnpm test:e2e:chromium

# interactive UI mode
pnpm test:e2e:ui
```

### Test structure by test cases

```
tests/e2e/
├── auth/
│   ├── login.spec.ts
│   │   ├── shows login form and switches to sign up tab
│   │   ├── logs in successfully and lands on employees
│   │   ├── shows error for invalid credentials
│   │   ├── redirects authenticated users away from login
│   │   └── navigates to forgot password
│   ├── register-verify.spec.ts
│   │   ├── registers a new account and opens verify email
│   │   ├── shows error when account already exists
│   │   ├── verifies email with OTP and redirects to users
│   │   └── later skips verification and goes to users
│   ├── forgot-reset.spec.ts
│   │   ├── sends password recovery instructions
│   │   ├── shows error for unknown email
│   │   ├── redirects reset page without token to forgot password
│   │   └── resets password with token and signs in
│   └── logout-guards.spec.ts
│       ├── redirects unauthenticated users from dashboard to login
│       ├── redirects root based on auth state
│       ├── logs out from user menu and clears session
│       └── shows 404 page for unknown routes
├── users/
│   ├── list.spec.ts
│   │   ├── lists employees with profile data
│   │   ├── filters employees by search
│   │   └── opens employee profile from the list
│   └── profile.spec.ts
│       ├── edits own profile fields
│       ├── shows other user profile as read-only
│       └── navigates between profile tabs
├── skills/
│   └── profile-skills.spec.ts
│       ├── lists current user skills and adds a new one
│       ├── removes a skill after selection
│       ├── shows other user skills as read-only
│       └── opens skills from own profile route
├── languages/
│   └── profile-languages.spec.ts
│       ├── lists languages and adds a new one
│       ├── removes a language
│       └── shows other user languages as read-only
├── cvs/
│   ├── list-crud.spec.ts
│   │   ├── lists existing CVs
│   │   ├── creates a new CV
│   │   ├── edits a CV from the list menu
│   │   ├── views a CV from the list menu
│   │   ├── deletes a CV
│   │   └── searches CVs by name
│   └── details-skills-projects-preview.spec.ts
│       ├── updates CV details
│       ├── manages CV skills
│       ├── adds a CV project
│       ├── removes a CV project
│       ├── shows CV preview and exports PDF
│       ├── navigates CV tabs
│       └── shows 404 for non-owner CV
├── settings/
│   └── settings.spec.ts
│       ├── opens settings from user menu
│       ├── changes theme
│       ├── changes language
│       ├── updates password successfully
│       └── shows error for incorrect current password
├── smoke/
│   └── navigation.spec.ts
│       ├── navigates main sidebar sections
│       ├── opens own profile from user menu
│       ├── toggles sidebar
│       └── blocks mobile viewports
└── fixtures/          # shared helpers (auth, GraphQL mocks, UI, data)
```
