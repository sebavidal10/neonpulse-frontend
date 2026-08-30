---
name: neonpulse-frontend-guide
description: Architecture rules, Component Directory Pattern, i18n conventions, and testing guidelines for the NeonPulse Vite/TypeScript frontend.
---

# NeonPulse Frontend Development Guide

Use this skill when developing or testing features in `neonpulse-frontend`.

## Key Guidelines

1. **Architecture & File Organization**:
   - `src/models`: Strongly-typed TypeScript domain interfaces.
   - `src/services`: Pure service layer managing backend API transport and session storage.
   - `src/components`: Component Directory Pattern with DOM manipulation and event handlers.
   - `src/i18n`: Central English translations dictionary (`en.ts`).

2. **Simulated Happy-Path Checkout (KISS)**:
   - Payment simulation uses animated loader and delay config (`SIMULATED_PAYMENT_DELAY_MS`) without redundant checkout complexity.

3. **Testing Standards**:
   - Every component, service, and utility must include corresponding Vitest tests in `tests/`.
   - Run `pnpm test` and `pnpm coverage` before finalizing changes.
