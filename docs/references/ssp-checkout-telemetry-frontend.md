# SSP Checkout Frontend Telemetry - Implementation Documentation

## Overview
This document details the implementation of Segment-based event tracking for the SSP Teams Plan checkout flow. The tracking system identifies user drop-offs and interaction patterns across the checkout funnel to support data-driven decision-making for conversion rate optimization.

**Project ID**: SSP-TELEMETRY-FE  
**Feature Branch**: `feat/ssp-telemetry-frontend`  
**Status**: ✅ Complete  
**Implementation Date**: March 2026

---

## Architecture & Design

### Core Principles
1. **Non-intrusive**: Tracking never blocks user workflows
2. **Resilient**: All tracking calls wrapped in try/catch blocks
3. **Privacy-first**: Sensitive data (passwords) never logged
4. **Performant**: Debounced tracking for high-frequency events
5. **Testable**: All tracking logic fully unit tested

---

## Key Technical Implementation

### Custom Tracking Utilities
- `trackFieldBlur`: Standard blur event tracking (plain function)
- `trackDebouncedFieldBlur`: Debounced tracking for URL/slug fields (plain function, 500ms)

### Tracking Constants  
Located in `src/constants/events.ts` and `src/constants/checkout.ts`:
- Event names, tracked fields, plan types (`events.ts`)
- Checkout steps (`checkout.ts`)

### Field Instrumentation
**Step 1 - Plan Details**:
- LicensesField: numLicenses
- NameAndEmailFields: fullName, adminEmail, country  
- Page view tracking

**Step 2 - Registration & Account Details**:
- RegisterAccountFields: username, password (interaction only - NO VALUE LOGGED)
- CompanyNameField: companyName
- CustomUrlField: urlSlug (debounced)
- Page view tracking  
- Registration success tracking

---

## Security & Privacy

**CRITICAL**: Password field tracking uses `{ interaction: 'blur' }` property. The password VALUE is NEVER logged or transmitted - only the blur event is tracked.

---

## Test Results

✅ **All 386 tests passing**  
✅ **100% coverage** for `trackFieldBlur` (in `useFieldTracking.ts`) and `trackDebouncedFieldBlur` (in `useDebounceTrackFieldBlur.ts`)
✅ **Lint passed** - No errors  
✅ **TypeScript checks passed** - No type errors

---

## Event Properties Standard

All tracking events include:
- `checkoutIntentId`: number | null
- `step`: 'plan-details' | 'account-details' | 'register'
- `field_name`: string
- `plan_type`: 'teams'
- `org_slug`: string (optional, for urlSlug field)
- `interaction`: 'blur' (for password field only)

---

## Gotchas

- **Anonymous users need `CheckoutSegmentAnalyticsService`.** For anonymous users, frontend-platform's
  `SegmentAnalyticsService.identifyAnonymousUser` turns Segment off if `window.ga.create` or
  `window.google_tag_manager` is missing 2s after start-up. Checkout loads neither, so every event
  (legacy and V2) was silently dropped until the user was logged in and reloaded the page.
  `src/utils/checkoutAnalyticsService.ts` overrides that method and is passed to `initialize()` in
  `src/index.tsx`. Don't remove it, and don't stub `window.ga`/`google_tag_manager` instead, until
  frontend-platform drops the check (a test in `checkoutAnalyticsService.test.ts` fails when it does).
- **Feature flags are set at build time.** `FEATURE_SSP_CHECKOUT_SEGMENT_EVENTS_V2` comes from
  edx-internal `frontends/frontend-app-enterprise-checkout/{stage,prod}_config.yml` and is inlined
  by webpack. After changing it there, rebuild and redeploy the MFE, or the old value stays live.
- **Identify after in-app logistration.** frontend-platform identifies the user only at app init.
  After login/register in the plan details step, `identifyCheckoutUser` (`src/utils/checkoutEvents.ts`)
  identifies them before `signed_in`/`account_created`, so later events carry the `userId`. It is not
  gated on the V2 flag, because legacy events need the `userId` too. `CheckoutSegmentAnalyticsService`
  skips its leftover-user `analytics.reset()` once a user has been identified in-app, because if
  analytics.js loads after the 2s timeout, its `ready` callback would otherwise reset the user who
  just signed in.
- **Page title in events.** Segment reads `document.title` when each event is sent (`title` on page
  events, `context.page.title` on track events). All stepper steps stay mounted, so each step's
  `<Helmet>` lives inside its `Stepper.Step` (only the active one renders) with `defer={false}`, so
  the title is set before the effects that send events.
- **Registration on stage from localhost.** `RECAPTCHA_SITE_KEY_WEB` is empty locally, so
  registration sends no reCAPTCHA token. To reach the later steps, log in with an existing stage
  account instead.

---

## Acceptance Criteria

✅ All criteria met - See PRD spec for details

**Last Updated**: March 19, 2026
