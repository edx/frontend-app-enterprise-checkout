# SSP Checkout Telemetry Frontend - Implementation Documentation

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

### Custom Hooks
- `useFieldTracking`: Standard blur event tracking
- `useDebounceTracking`: Debounced tracking for URL/slug fields (500ms)

### Tracking Constants  
Located in `src/constants/tracking.ts`:
- Event names, checkout steps, tracked fields, plan types

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
✅ **100% coverage** for `useFieldTracking.ts` and `useDebounceTracking.ts`  
✅ **Lint passed** - No errors  
✅ **TypeScript checks passed** - No type errors

---

## Event Properties Standard

All tracking events include:
- `checkoutIntentId`: number | null
- `step`: 'plan_details' | 'registration' | 'account_details'  
- `field_name`: string
- `plan_type`: 'teams'
- `org_slug`: string (optional, for urlSlug field)
- `interaction`: 'blur' (for password field only)

---

## Acceptance Criteria

✅ All criteria met - See PRD spec for details

**Last Updated**: March 19, 2026
