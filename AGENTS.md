# NeonPulse Frontend - AI Agent Guidelines (`AGENTS.md`)

This document establishes the architecture rules, coding guidelines, testing standards, and best practices for AI agents assisting in development on **`neonpulse-frontend`**.

---

## 🏛️ Project Architecture & Tech Stack

- **Tech Stack**: TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Vitest (JSDOM), v8 coverage provider.
- **Port**: `5173`.
- **Architecture Pattern**: Component Directory Pattern & Service Layer:
  - **`src/models/`**: Strongly-typed TypeScript interfaces and enums (`Concert`, `ConcertStatus`, `User`, `Ticket`, `PurchaseResponse`).
  - **`src/services/`**: API and state communication layer (`AuthService`, `TicketService`, `ConcertService`).
  - **`src/components/`**: Modular self-contained DOM components with isolated markup and behavior:
    - `BookingForm/`: Ticket reservation and simulated 1-click checkout.
    - `AuthModal/`: Tabbed Sign In & Sign Up modal.
    - `MyTickets/`: Digital pass vault displaying tickets with QR simulations.
    - `ConcertCard/`: Gig presentation cards.
    - `FeaturedBanner/`: Headline show banner.
    - `StateViews/`: Error and empty states.
    - `LoadingSkeleton/`: Visual placeholder skeletons.
  - **`src/views/`**: View layer orchestrators (`ConcertBoardView`).
  - **`src/i18n/`**: Centralized localization dictionary in English (`src/i18n/en.ts`) with parameter substitution helper (`t(key, params)`).

---

## 📐 Core Engineering Principles

1. **KISS (Keep It Simple, Stupid)**:
   - For demo payment flows, utilize simulated latency (`APP_CONFIG.SIMULATED_PAYMENT_DELAY_MS`) with clear animated feedback.
   - Avoid speculative dependencies; prefer clean vanilla DOM manipulation and Tailwind CSS utilities.

2. **Single Responsibility Principle (SRP)**:
   - Components handle presentation and UI event dispatching.
   - Services handle HTTP requests, headers, and token storage.
   - Internationalization helper handles all static text dictionary lookups.

3. **Strict English & Localization Standard**:
   - All code, identifiers, types, comments, and UI strings must be in **English**.
   - UI static strings must be added to `src/i18n/en.ts`.

4. **High-Standard Automated Testing**:
   - Maintain comprehensive unit and integration tests in `tests/`.
   - Run `pnpm test` and `pnpm coverage` to verify test suite passing.
   - Validate production build with `pnpm build`.

---

## 🚀 Common Commands

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Run Vitest test suite
pnpm test

# Run Vitest coverage report
pnpm coverage

# Production build validation (TypeScript check + Vite bundle)
pnpm build
```
