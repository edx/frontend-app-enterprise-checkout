# SSP Checkout Telemetry Frontend - Event Tracking

**Project**: SSP-TELEMETRY-FE
**Branch**: `feat/ssp-telemetry-frontend`
**Status**: ✅ Implementation Complete (Tests Pending)
**Date**: March 2026

## Overview

This document describes the Segment-based event tracking implementation for the SSP Teams Plan checkout flow. The tracking system captures user interactions and page views to identify drop-offs and interaction patterns across the checkout funnel.

## Architecture

### Event Tracking Flow

```
User Interaction (Field Blur / Page Load)
    ↓
Custom Hook (useFieldTracking / useDebounceTracking / useEffect)
    ↓
sendEnterpriseCheckoutTrackingEvent()
    ↓
Segment sendTrackEvent()
    ↓
Analytics Backend
```

### Core Components

#### 1. Tracking Hooks (`src/hooks/`)

- **`useFieldTracking`**: Tracks field blur events
- **`useDebounceTracking`**: Tracks field blur events with debouncing (for frequently-changing fields like URL slugs)

#### 2. Tracking Constants (`src/constants/tracking.ts`)

Centralized constants for:
- Event names (`CHECKOUT_FIELD_BLUR`, `CHECKOUT_PAGE_VIEW`, `CHECKOUT_REGISTRATION_SUCCESS`)
- Step names (`STEP_PLAN_DETAILS`, `STEP_ACCOUNT_DETAILS`, `STEP_REGISTRATION`)
- Field names (e.g., `FIELD_NAME_NUM_LICENSES`, `FIELD_NAME_FULL_NAME`)
- Plan types (`PLAN_TYPE_TEAMS`)

#### 3. Instrumented Components

**Plan Details Step:**
- `LicensesField` - Tracks quantity selection
- `NameAndEmailFields` - Tracks fullName, adminEmail, country
- `PlanDetailsPage` - Tracks page view

**Registration Step:**
- `RegisterAccountFields` - Tracks username and password interaction
- `PlanDetailsRegisterContent` - Tracks page view
- `PlanDetailsPage` - Tracks registration success event

**Account Details Step:**
- `CompanyNameField` - Tracks company name
- `CustomUrlField` - Tracks URL slug with debouncing

## Implementation Details

### Hook Pattern: `useFieldTracking`

```typescript
const handleBlur = useFieldTracking({
  fieldName: 'fullName',
  step: 'plan_details',
  checkoutIntentId: checkoutIntentId,
  additionalProperties: { plan_type: 'teams' }
});

<Field.Input onBlur={handleBlur} />
```

**Features:**
- Error handling with `logError()`
- `useCallback` for stable reference
- Sends `checkout.field.blur` event

### Hook Pattern: `useDebounceTracking`

```typescript
const handleBlur = useDebounceTracking({
  fieldName: 'urlSlug',
  step: 'account_details',
  checkoutIntentId: checkoutIntentId,
  additionalProperties: {
    plan_type: 'teams',
    org_slug: slugValue
  },
  debounceMs: 500
});

<Field.Input onBlur={handleBlur} />
```

**Features:**
- Debouncing to prevent excessive events (default: 500ms)
- Cancels previous timeout on new blur
- Cleanup on unmount

### Page View Pattern

```typescript
useEffect(() => {
  if (!checkoutIntentId) return;

  try {
    sendEnterpriseCheckoutTrackingEvent({
      checkoutIntentId,
      eventName: TRACKING_EVENT_NAMES.CHECKOUT_PAGE_VIEW,
      properties: {
        step: 'plan_details',
        plan_type: 'teams',
      },
    });
  } catch (error) {
    logError('Failed to send page view tracking event', error);
  }
}, [checkoutIntentId]);
```

### Success Event Pattern

```typescript
registerMutation.onSuccess(() => {
  // ... other success logic

  try {
    sendEnterpriseCheckoutTrackingEvent({
      checkoutIntentId,
      eventName: TRACKING_EVENT_NAMES.CHECKOUT_REGISTRATION_SUCCESS,
      properties: {
        step: 'registration',
        plan_type: 'teams',
      },
    });
  } catch (error) {
    logError('Failed to send registration success tracking event', error);
  }
});
```

## Event Schema

### Field Blur Event

**Event Name**: `checkout.field.blur`

**Properties:**
```json
{
  "checkout_intent_id": 123,
  "step": "plan_details | registration | account_details",
  "field_name": "numLicenses | fullName | adminEmail | country | username | password | companyName | urlSlug",
  "plan_type": "teams",
  "org_slug": "my-org",  // (account_details step only)
  "interaction": "blur"   // (password field only - NEVER logs value)
}
```

### Page View Event

**Event Name**: `checkout.page.view`

**Properties:**
```json
{
  "checkout_intent_id": 123,
  "step": "plan_details | registration",
  "plan_type": "teams"
}
```

### Registration Success Event

**Event Name**: `checkout.registration.success`

**Properties:**
```json
{
  "checkout_intent_id": 123,
  "step": "registration",
  "plan_type": "teams"
}
```

## Tracked Fields

### Plan Details Step (`step: 'plan_details'`)

| Field | Field Name | Component | Hook Type |
|-------|------------|-----------|-----------|
| Number of Licenses | `numLicenses` | LicensesField | useFieldTracking |
| Full Name | `fullName` | NameAndEmailFields | useFieldTracking |
| Admin Email | `adminEmail` | NameAndEmailFields | useFieldTracking |
| Country | `country` | NameAndEmailFields | useFieldTracking |

### Registration Step (`step: 'registration'`)

| Field | Field Name | Component | Hook Type | Notes |
|-------|------------|-----------|-----------|-------|
| Username | `username` | RegisterAccountUsername | useFieldTracking | |
| Password | `password` | RegisterAccountPassword | useFieldTracking | **CRITICAL**: Only tracks interaction, never value |

### Account Details Step (`step: 'account_details'`)

| Field | Field Name | Component | Hook Type | Notes |
|-------|------------|-----------|-----------|-------|
| Company Name | `companyName` | CompanyNameField | useFieldTracking | |
| URL Slug | `urlSlug` | CustomUrlField | useDebounceTracking | 500ms debounce, includes org_slug property |

## Security & Privacy

### Password Field Tracking

**CRITICAL SECURITY REQUIREMENT**: Password tracking MUST NEVER log the password value.

**Implementation:**
- Uses `interaction: 'blur'` property
- Password value is NEVER passed to tracking hooks
- Only interaction events are tracked
- useFieldTracking hook never receives password value

**Example:**
```typescript
// ✅ CORRECT - Only tracks interaction
const handlePasswordBlur = useFieldTracking({
  fieldName: 'password',
  step: 'registration',
  checkoutIntentId,
  additionalProperties: {
    plan_type: 'teams',
    interaction: 'blur'  // Explicitly marks as interaction-only
  }
});

// ❌ WRONG - NEVER DO THIS
// Never pass password value to tracking
```

## Testing

### Hook Tests

**Location**: `src/hooks/tests/`

**Coverage**: 100%

**Test Files:**
- `useFieldTracking.test.ts` - 9 test cases
- `useDebounceTracking.test.ts` - 11 test cases

**Key Test Scenarios:**
- Event properties are correctly passed
- Error handling with logError
- Debouncing behavior
- Null checkoutIntentId handling
- Multiple calls and cleanup
- useCallback stability

### Component Tests

**Status**: ⚠️ Pending Update

**Required Changes:**
- Add QueryClientProvider wrapper to existing tests
- Mock useBFFContext hook
- Verify tracking hooks are called with correct parameters
- Verify password tracking never logs value

**Files Requiring Updates:**
- `LicensesField.test.tsx`
- `NameAndEmailFields.test.tsx`
- `RegisterAccountFields.test.tsx`
- `CompanyNameField.test.tsx`
- `CustomUrlField.test.tsx`
- `PlanDetailsPage.test.tsx`
- `PlanDetailsRegisterContent.test.tsx`

## Key Learnings

### Architecture Patterns

1. **BFF Context Access**: Use `useBFFContext(userId)` hook to access checkout context. The checkoutIntentId is at `bffContext?.checkoutIntent?.id`.

2. **Field Component Props**: The Field component accepts additional props via spread operator, making it easy to add onBlur handlers without modifying component signatures.

3. **Dynamic Property Values**: Use `form.watch('fieldName')` to get current field values for tracking properties (e.g., org_slug). This ensures tracking events include up-to-date values.

### Challenges & Solutions

1. **Debouncing Implementation**: Used `useRef` for timeout management with proper cleanup on unmount to prevent memory leaks.

2. **TypeScript Compatibility**: Used `NodeJS.Timeout` type for timeout ref in useDebounceTracking hook.

3. **Import Order Linting**: ESLint requires external imports (@edx) before React imports. Fixed by reordering imports consistently.

4. **Password Security**: For password field tracking, added explicit `interaction: 'blur'` property to clearly indicate interaction-only tracking.

5. **Testing with QueryClient**: Components using tracking hooks also use useBFFContext, which requires QueryClientProvider in tests.

### Best Practices

1. **Error Handling**: Always wrap tracking calls in try/catch with logError()
2. **Null Safety**: Check for checkoutIntentId before sending events
3. **Debouncing**: Apply debouncing to frequently-changing fields (URL slugs, autocomplete)
4. **Constants**: Use centralized constants for event names, steps, and field names
5. **Documentation**: Explicitly document security-sensitive tracking (passwords)

## Future Enhancements

### Potential Improvements

1. **Enhanced Error Tracking**: Track validation errors and their frequencies
2. **Time-on-Field Metrics**: Track how long users spend on each field
3. **Field Interaction Sequences**: Track the order of field interactions
4. **Abandonment Tracking**: Track when users leave without completing
5. **A/B Test Support**: Add experiment_id to tracking properties

### Test Coverage Improvements

1. Complete component test updates with QueryClient mocks
2. Integration tests for full checkout flow
3. E2E tests with real Segment integration
4. Manual QA verification in browser devtools

## Related Documentation

- **PRD**: `.ralph/telemetry-tracking-prd.md`
- **Spec**: `.ralph/specs/ssp-checkout-telemetry-frontend.json`
- **Fix Plan**: `.ralph/fix_plan.md`
- **Architecture**: `CLAUDE.md`
- **Analytics Utility**: `src/utils/common.ts` (sendEnterpriseCheckoutTrackingEvent)

## Support & Maintenance

### Troubleshooting

**Events not firing?**
- Check browser console for errors
- Verify checkoutIntentId is not null
- Check Segment debugger in browser devtools

**Wrong event properties?**
- Review tracking constants in `src/constants/tracking.ts`
- Check additionalProperties object in hook calls
- Verify form.watch() values for dynamic properties

**Tests failing?**
- Ensure QueryClientProvider is in test wrapper
- Mock useBFFContext hook properly
- Verify tracking hooks are mocked

### Contact

For questions or issues, contact the SSP team or refer to the main Enterprise Checkout MFE documentation.

---

**Last Updated**: March 2026
**Authors**: Ralph (AI Development Agent)
**Version**: 1.0
