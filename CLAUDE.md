# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

frontend-app-enterprise-checkout is a React-based micro-frontend within the Open edX ecosystem that provides a self-service B2B checkout experience to onboard and provision new enterprise customers. It bridges the gap between a B2B marketing website and the authenticated Enterprise Admin/Learner experience, handling Stripe payment integration, customer provisioning, and user registration/login.

## Test and Quality Instructions

- To run unit tests: `npm test` (runs Jest with coverage)
- To run tests in watch mode: `npm run test:watch`
- To run linting: `npm run lint`
- To fix linting issues: `npm run lint:fix`
- To check TypeScript types: `npm run check-types`
- To build: `npm run build`

## Code Navigation

- Prefer using the LSP tool over grep/glob when navigating TypeScript/JavaScript code (definitions, references, type info)

## Key Principles

- Search the codebase before assuming something isn't implemented
- Write comprehensive tests with clear documentation
- Follow Test-Driven Development when refactoring or modifying existing functionality
- Always write tests for new functionality you implement
- Keep changes focused and minimal
- Follow existing code patterns and component structure
- Use Paragon components from `@openedx/paragon` - invoke the `/paragon` skill for guidance

## Documentation & Institutional Memory

- Document new functionality in `docs/` or a relevant location
- When you learn something important about how this codebase works (gotchas, non-obvious
  patterns, integration quirks), capture it in the appropriate docs
- These docs are institutional memory - future sessions (yours or others) will benefit
  from what you record here
- Architecture decisions are documented in `docs/decisions/` using ADR format

## Architecture Overview

This is a React TypeScript MFE for B2B self-service checkout, built on edX's frontend-platform architecture.

### Key Technologies

- **React 18** with React Router v6 for navigation
- **TypeScript** for type safety (ADR-003)
- **TanStack Query (React Query)** for server state management with query key factories
- **Zustand** for client state management (checkout form store)
- **react-hook-form + zod** for form handling and validation (ADR-005)
- **@openedx/paragon** for UI components
- **Stripe React** (@stripe/react-stripe-js) for payment processing
- **Webpack** via @openedx/frontend-build for bundling

### Feature-Based Organization (ADR-002)

**IMPORTANT:** This codebase follows feature-based organization rather than type-based.

Always read `docs/decisions/0002-feature-based-application-organization.rst` before making structural changes.

Key principles:
- Features are organized in `src/components/` by functionality, not by type
- Each feature has its own directory with public interface via `index.ts`
- Data management is separated from components using `data/` subdirectories
- Strict module boundaries prevent circular dependencies
- A feature may import from its children and siblings, but never from its parentage
- Data directories contain files named by function: `actions.ts`, `services.ts`, `queries.ts`, etc.

### Directory Structure

- **src/components/** - Feature-based React components and page-level containers
  - **app/** - Root application component, layout, routing, and app-wide data
  - **Stepper/** - Multi-step checkout flow (Plan Details -> Account Details -> Billing Details)
  - **FormFields/** - Reusable form field components
  - **PurchaseSummary/** - Order summary display
  - **plan-details-pages/** - Plan selection and configuration
  - **account-details-page/** - User registration/login
  - **billing-details-pages/** - Payment and billing information
  - **confirmation-page/** - Post-purchase confirmation
- **src/hooks/** - Custom React hooks
- **src/utils/** - Utility functions and common logic
- **src/constants/** - Application constants
- **src/plugin-slots/** - Frontend plugin framework slots for customization
- **src/types/** - Shared TypeScript type definitions
- **docs/decisions/** - Architecture Decision Records (ADRs)

### TypeScript Paths

Configured path aliases for cleaner imports:
- `@/components/*` -> `./src/components/*`
- `@/hooks/*` -> `./src/hooks/*`
- `@/constants/*` -> `./src/constants/*`
- `@/utils/*` -> `./src/utils/*`

### Key Concepts

- **Checkout Context**: Server-provided context including existing customers, pricing, and field constraints
- **Checkout Intent**: Server-side representation of the checkout session, tracked through states (created -> paid -> fulfilled)
- **Checkout Session**: Stripe-side session for payment processing
- **Stepper Flow**: Multi-step wizard pattern guiding users through plan selection, account creation, and payment
- **Form State**: Persisted across steps using Zustand store (`useCheckoutFormStore`)
- **Query Key Factory**: Centralized management of TanStack Query keys using @lukemorales/query-key-factory

### External Service Integration

- **enterprise-access**: Backend for Frontend (BFF) checkout API, checkout intents, pricing, customer provisioning
  - Base URL: `ENTERPRISE_ACCESS_BASE_URL` (default: http://localhost:18270)
  - Primary endpoints: `/api/v1/bffs/checkout/*`
- **LMS**: User authentication, registration, login/logout
  - Base URL: `LMS_BASE_URL` (default: http://localhost:18000)
  - Handles user session management
- **Stripe**: Payment processing via Stripe.js and Elements
  - Uses publishable key from `PUBLISHABLE_STRIPE_API_KEY`
  - Handles payment method collection and checkout session creation

### Local Development

- Runs on `localhost:1989`
- Start with: `npm start`
- Requires devstack and enterprise-access service running
- See README.rst for complete setup instructions including required enterprise-access settings

### State Management

- **Server State**: TanStack Query with 20-second stale time and retry logic
- **Form State**: Zustand store persists form data across checkout steps
- **Step Navigation**: Custom hooks (`useCurrentStep`, `useCurrentPage`) manage stepper state
- **Authentication**: Managed by @edx/frontend-platform

### Form Implementation

All forms use react-hook-form with zod validation schemas:
- Form fields are in `src/components/FormFields/`
- Validation schemas defined with zod for type safety
- Integration with @openedx/paragon form components
- Real-time validation with debounced backend checks for registration fields

## Testing Notes

- Uses Jest and React Testing Library
- Test files co-located with components (`Component.test.tsx`)
- Factory functions for test data using rosie (in `__factories__/` directories)
- Coverage reporting enabled by default
- Snapshot testing available with `npm run snapshot`

## Important Patterns

### Data Fetching
- Use TanStack Query for all API calls
- Query keys managed via centralized factory in `src/components/app/data/queries/queryKeyFactory.ts`
- Service functions live in feature's `data/services/` directory
- Server state transformations happen in service layer, not components

### Form Handling
- Use react-hook-form's `useForm` hook with zod schema validation
- Keep validation schemas co-located with form components
- Use Paragon's form components for consistent styling
- Debounce validation for registration fields (username, email)

### Module Boundaries
- Always import from a feature's public interface (index.ts), never reach into subdirectories
- Keep circular dependencies in check by following ADR-002 import rules
- Configure modules from their parent (dependency injection pattern)
