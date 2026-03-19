# SSP Checkout Telemetry Frontend - Implementation Documentation

## Overview

This document captures the implementation details, patterns, and learnings from adding Segment-based event tracking to the SSP (Self-Service Provisioning) Teams Plan checkout flow.

**Project ID:** SSP-TELEMETRY-FE
**Feature Branch:** `feat/ssp-telemetry-frontend`
**Implementation Date:** March 2026

## Purpose

Track user interactions and drop-off points throughout the checkout funnel to identify pain points and optimize conversion rates. This implementation focuses on frontend event tracking using Segment analytics.

## Architecture

### Core Infrastructure

#### 1. Tracking Constants (`src/constants/tracking.ts`)

Centralized constants for all tracking-related values:

```typescript
export const TRACKING_EVENT_NAMES = {
  CHECKOUT_FIELD_BLUR: 'checkout.field.blur',
  CHECKOUT_PAGE_VIEW: 'checkout.page.view',
  CHECKOUT_REGISTRATION_SUCCESS: 'checkout.registration.success',
} as const;

export const CHECKOUT_STEPS = {
  PLAN_DETAILS: 'plan_details',
  ACCOUNT_DETAILS: 'account_details',
  REGISTRATION: 'registration',
} as const;

export const TRACKED_FIELDS = {
  NUM_LICENSES: 'numLicenses',
  FULL_NAME: 'fullName',
  ADMIN_EMAIL: 'adminEmail',
  COUNTRY: 'country',
  USERNAME: 'username',
  PASSWORD: 'password',
  COMPANY_NAME: 'companyName',
  URL_SLUG: 'urlSlug',
} as const;
```

#### 2. Custom Hooks

**`useFieldTracking`** - Standard field blur tracking
```typescript
const handleBlur = useFieldTracking({
  fieldName: TRACKED_FIELDS.FULL_NAME,
  step: CHECKOUT_STEPS.PLAN_DETAILS,
  checkoutIntentId,
  additionalProperties: { plan_type: PLAN_TYPE.TEAMS },
});
```

**`useDebounceTracking`** - Debounced tracking for high-frequency fields
```typescript
const handleBlur = useDebounceTracking({
  fieldName: TRACKED_FIELDS.URL_SLUG,
  step: CHECKOUT_STEPS.ACCOUNT_DETAILS,
  checkoutIntentId,
  additionalProperties: {
    plan_type: PLAN_TYPE.TEAMS,
    org_slug: enterpriseSlugValue,
  },
  debounceMs: 500,
});
```

### Tracked Events

#### Field Blur Events (8 fields)

**Step 1: Plan Details** (`plan_details` step)
- `numLicenses` - Number of licenses field
- `fullName` - User's full name
- `adminEmail` - Work email address
- `country` - Country selection

**Step 2: Registration** (`registration` step)
- `username` - Public username
- `password` - Password field (interaction only, NEVER logs value) 🔒

**Step 2: Account Details** (`account_details` step)
- `companyName` - Organization name
- `urlSlug` - Custom URL slug (debounced 500ms) ⏱️

#### Page View Events (2 pages)

1. **Plan Details Page** - Fires on `PlanDetailsPage` mount
   - Step: `plan_details`
   - Event: `CHECKOUT_PAGE_VIEW`

2. **Registration Page** - Fires on `PlanDetailsRegisterContent` mount
   - Step: `registration`
   - Event: `CHECKOUT_PAGE_VIEW`

#### Success Events (1)

1. **Registration Success** - Fires on successful registration submission
   - Step: `registration`
   - Event: `CHECKOUT_REGISTRATION_SUCCESS`
   - Location: `registerMutation.onSuccess` callback in `PlanDetailsPage`

## Implementation Patterns

### Pattern 1: Field Component Tracking

Standard pattern for adding tracking to form fields:

```typescript
// 1. Import dependencies
import { AppContext } from '@edx/frontend-platform/react';
import { useContext } from 'react';
import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { CHECKOUT_STEPS, PLAN_TYPE, TRACKED_FIELDS } from '@/constants/tracking';
import { useFieldTracking } from '@/hooks/useFieldTracking';

// 2. Get authentication context
const { authenticatedUser }: AppContextValue = useContext(AppContext);
const { data: bffContext } = useBFFContext(authenticatedUser?.userId || null);
const checkoutIntentId = bffContext?.checkoutIntent?.id || null;

// 3. Create tracking handler
const handleFieldBlur = useFieldTracking({
  fieldName: TRACKED_FIELDS.FIELD_NAME,
  step: CHECKOUT_STEPS.APPROPRIATE_STEP,
  checkoutIntentId,
  additionalProperties: { plan_type: PLAN_TYPE.TEAMS },
});

// 4. Attach to field component
<Field
  form={form}
  name="fieldName"
  onBlur={handleFieldBlur}
  // ... other props
/>
```

### Pattern 2: Page View Tracking

Standard pattern for page view events:

```typescript
// 1. Import dependencies
import { logError } from '@edx/frontend-platform/logging';
import { AppContext } from '@edx/frontend-platform/react';
import { useContext, useEffect } from 'react';
import useBFFContext from '@/components/app/data/hooks/useBFFContext';
import { CHECKOUT_STEPS, PLAN_TYPE, TRACKING_EVENT_NAMES } from '@/constants/tracking';
import { sendEnterpriseCheckoutTrackingEvent } from '@/utils/common';

// 2. Get context
const { authenticatedUser }: AppContextValue = useContext(AppContext);
const { data: bffContext } = useBFFContext(authenticatedUser?.userId || null);
const checkoutIntentId = bffContext?.checkoutIntent?.id || null;

// 3. Fire page view on mount
useEffect(() => {
  try {
    sendEnterpriseCheckoutTrackingEvent({
      checkoutIntentId,
      eventName: TRACKING_EVENT_NAMES.CHECKOUT_PAGE_VIEW,
      properties: {
        step: CHECKOUT_STEPS.APPROPRIATE_STEP,
        plan_type: PLAN_TYPE.TEAMS,
      },
    });
  } catch (error) {
    logError('Failed to send page view tracking event', error);
  }
}, [checkoutIntentId]);
```

### Pattern 3: Dynamic Property Values

Using `form.watch()` for real-time field values in tracking:

```typescript
// Get current field value
const enterpriseSlugValue = form.watch('enterpriseSlug') || '';

// Include in tracking properties
const handleBlur = useDebounceTracking({
  fieldName: TRACKED_FIELDS.URL_SLUG,
  step: CHECKOUT_STEPS.ACCOUNT_DETAILS,
  checkoutIntentId,
  additionalProperties: {
    plan_type: PLAN_TYPE.TEAMS,
    org_slug: enterpriseSlugValue, // Dynamic value
  },
  debounceMs: 500,
});
```

## Security Considerations

### Password Field Tracking

**CRITICAL:** Password tracking must NEVER log or transmit the password value.

✅ **Correct Implementation:**
```typescript
const handlePasswordBlur = useFieldTracking({
  fieldName: TRACKED_FIELDS.PASSWORD,
  step: CHECKOUT_STEPS.REGISTRATION,
  checkoutIntentId,
  additionalProperties: {
    plan_type: PLAN_TYPE.TEAMS,
    interaction: 'blur', // Explicit interaction tracking
  },
});
```

❌ **NEVER DO THIS:**
```typescript
// WRONG - This would log the password value
const password = form.getValues('password');
additionalProperties: { password_value: password } // NEVER!
```

The tracking hook only fires the event on blur interaction - it never accesses or transmits the field value.

## Performance Optimizations

### Debouncing

The URL slug field uses debounced tracking to prevent excessive event volume:

```typescript
const handleUrlSlugBlur = useDebounceTracking({
  fieldName: TRACKED_FIELDS.URL_SLUG,
  step: CHECKOUT_STEPS.ACCOUNT_DETAILS,
  checkoutIntentId,
  additionalProperties: {
    plan_type: PLAN_TYPE.TEAMS,
    org_slug: enterpriseSlugValue,
  },
  debounceMs: 500, // 500ms delay
});
```

**Why debouncing?**
- Users type/edit the URL slug frequently
- Without debouncing, each keystroke would fire an event
- 500ms delay ensures we only track meaningful interactions

**Implementation Details:**
- Uses `useRef` for timeout management
- Cleanup on component unmount prevents memory leaks
- Clears previous timeout before setting new one

## Event Properties Standard

All tracking events include:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `checkoutIntentId` | number \| null | Yes | Unique checkout session identifier |
| `step` | string | Yes | Checkout step: `plan_details`, `registration`, or `account_details` |
| `field_name` | string | Field events | Name of the tracked field |
| `plan_type` | string | Yes | Always `'teams'` for SSP |
| `org_slug` | string | Optional | Organization URL slug (where available) |
| `interaction` | string | Optional | Explicit interaction type (used for password) |

## Error Handling

All tracking calls are wrapped in try/catch blocks:

```typescript
try {
  sendEnterpriseCheckoutTrackingEvent({
    checkoutIntentId,
    eventName: TRACKING_EVENT_NAMES.CHECKOUT_FIELD_BLUR,
    properties: { /* ... */ },
  });
} catch (error) {
  logError('Failed to send tracking event for field: fieldName', error);
}
```

**Why this matters:**
- Tracking failures should never break the user experience
- Errors are logged for debugging but don't interrupt the checkout flow
- Using `logError` from `@edx/frontend-platform/logging` ensures proper error reporting

## Component Integration Summary

### Modified Components

1. **`LicensesField.tsx`** - Added numLicenses tracking
2. **`NameAndEmailFields.tsx`** - Added fullName, adminEmail, country tracking
3. **`PlanDetailsPage.tsx`** - Added page view and registration success tracking
4. **`RegisterAccountFields.tsx`** - Added username and password (interaction-only) tracking
5. **`CompanyNameField.tsx`** - Added companyName tracking
6. **`CustomUrlField.tsx`** - Added urlSlug tracking with debouncing
7. **`PlanDetailsRegisterContent.tsx`** - Added registration page view tracking

## Testing Strategy

### Unit Tests Required

The implementation requires unit tests for:

1. **Hook Tests:**
   - `useFieldTracking` - Verify event fires on blur with correct properties
   - `useDebounceTracking` - Verify debouncing behavior and cleanup

2. **Component Tests:**
   - All modified components should verify tracking handlers are called
   - Mock `sendEnterpriseCheckoutTrackingEvent` to verify payloads
   - Ensure password tracking never logs values

### Test Patterns

```typescript
// Mock analytics
jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

// Mock BFF context
jest.mock('@/components/app/data/hooks/useBFFContext', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: {
      checkoutIntent: { id: 123 },
    },
  })),
}));

// Test tracking call
it('should fire tracking event on blur', () => {
  const { getByRole } = render(<ComponentWithTracking />);
  const field = getByRole('textbox');

  fireEvent.blur(field);

  expect(sendTrackEvent).toHaveBeenCalledWith(
    'checkout.field.blur',
    expect.objectContaining({
      checkoutIntentId: 123,
      step: 'plan_details',
      field_name: 'fullName',
    })
  );
});
```

## Challenges & Solutions

### Challenge 1: Debouncing Implementation
**Problem:** URL slug field needed debouncing to avoid excessive events
**Solution:** Created `useDebounceTracking` hook with `useRef` for timeout management and proper cleanup on unmount

### Challenge 2: TypeScript Compatibility
**Problem:** Timeout type compatibility across environments
**Solution:** Used `NodeJS.Timeout` type which works in both Node and browser contexts

### Challenge 3: Import Order Linting
**Problem:** ESLint requires specific import order
**Solution:** External imports (@edx) must come before React imports, internal imports last

### Challenge 4: Password Security
**Problem:** Need to track password field without logging value
**Solution:** Added explicit `interaction: 'blur'` property and never accessed field value in tracking code

### Challenge 5: Dynamic Property Values
**Problem:** Need current field value in tracking properties
**Solution:** Used `form.watch('fieldName')` to get real-time values for properties like `org_slug`

## Learnings & Best Practices

1. **BFF Context Access:** Use `useBFFContext(userId)` hook to access checkout context. The checkoutIntentId is at `bffContext?.checkoutIntent?.id`.

2. **Field Component Props:** The Field component accepts additional props via spread operator, making it easy to add onBlur handlers.

3. **Form.watch() for Dynamic Values:** Use `form.watch('fieldName')` to get current field values for tracking properties. This ensures real-time accuracy.

4. **Error Handling Pattern:** Always wrap tracking in try/catch with `logError()`. Tracking failures should never break user experience.

5. **useEffect Dependencies:** When using useEffect for tracking, depend on `checkoutIntentId` to re-fire if context loads late.

6. **Debouncing Cleanup:** Always cleanup timeouts on unmount to prevent memory leaks.

7. **Password Tracking:** Only track interaction events, never field values. Add explicit `interaction` property to make intent clear.

## PRD Mapping

The implementation maps to the PRD as follows:

| PRD Field Name | Actual Field Name | Component |
|----------------|-------------------|-----------|
| numLicenses | quantity | LicensesField |
| fullName | fullName | NameAndEmailFields |
| adminEmail | adminEmail | NameAndEmailFields |
| country | country | NameAndEmailFields |
| username | username | RegisterAccountUsername |
| password | password | RegisterAccountPassword |
| companyName | companyName | CompanyNameField |
| urlSlug | enterpriseSlug | CustomUrlField |
| org_slug (property) | enterpriseSlug (value) | CustomUrlField |

## Future Considerations

### Potential Enhancements

1. **User ID Tracking:** Add `user_id` property where available for better user journey analysis

2. **Focus Events:** Consider tracking field focus events in addition to blur for time-on-field metrics

3. **Validation Error Tracking:** Track validation errors to identify problematic fields

4. **Abandonment Tracking:** Add visibility change tracking to detect when users leave the page

5. **Performance Metrics:** Track time between page views to measure step completion time

### Maintenance Notes

- **Adding New Fields:** Follow Pattern 1 for standard field tracking
- **Adding New Pages:** Follow Pattern 2 for page view tracking
- **Debouncing:** Only use for high-frequency input fields (typing, live validation)
- **Testing:** Always add unit tests for new tracking to verify payloads and error handling

## References

- **PRD:** `.ralph/specs/ssp-checkout-telemetry-frontend.json`
- **Fix Plan:** `.ralph/fix_plan.md`
- **Architecture:** `CLAUDE.md`
- **Analytics Utility:** `src/utils/common.ts` (sendEnterpriseCheckoutTrackingEvent)
- **Form Fields:** `src/components/FormFields/`
- **Tracking Constants:** `src/constants/tracking.ts`
- **Tracking Hooks:** `src/hooks/useFieldTracking.ts`, `src/hooks/useDebounceTracking.ts`

## Implementation Commits

All work completed in 9 commits on branch `feat/ssp-telemetry-frontend`:

1. Core tracking infrastructure
2. LicensesField tracking
3. NameAndEmailFields tracking
4. PlanDetailsPage page view
5. RegisterAccountFields tracking
6. CompanyNameField tracking
7. CustomUrlField with debouncing
8. PlanDetailsRegisterContent page view
9. Registration success event

---

**Last Updated:** March 19, 2026
**Status:** Implementation Complete ✅
**Tests:** Pending manual verification
