# Fix Plan: SSP Telemetry Frontend Event Tracking

## Project Context
**PRD**: `.ralph/telemetry-tracking-prd.md`
**Spec**: `.ralph/specs/ssp-checkout-telemetry-frontend.json`
**Branch**: `feat/ssp-telemetry-frontend`
**Documentation**: `docs/references/ssp-checkout-telemetry-frontend.md` (to be created)

---

## Overview
Implement Segment-based event tracking for the SSP Teams Plan checkout flow to identify user drop-offs and interaction patterns across the checkout funnel.

---

## Implementation Tasks

### ✅ Completed Tasks

#### Phase 0: Setup ✅
- ✅ **Task 0.1**: Created and checked out feature branch `feat/ssp-telemetry-frontend`
- ✅ **Task 0.2**: Verified branch matches PRD specification

#### Phase 1: Core Tracking Infrastructure ✅
- ✅ **Task 1.1**: Created `src/hooks/useFieldTracking.ts`
  - Implemented custom hook that wraps field blur events with tracking
  - Accepts parameters: `fieldName`, `step`, `checkoutIntentId`, `additionalProperties`
  - Uses `sendEnterpriseCheckoutTrackingEvent` from `src/utils/common.ts`
  - Includes try/catch with `logError()` for error handling
  - Returns onBlur handler function

- ✅ **Task 1.2**: Created `src/hooks/useDebounceTracking.ts`
  - Implemented debouncing hook for URL/slug field (default 500ms delay)
  - Same error handling pattern as useFieldTracking
  - Cleanup on unmount to prevent memory leaks

- ✅ **Task 1.3**: Added tracking event constants in `src/constants/tracking.ts`
  - Event names: `CHECKOUT_FIELD_BLUR`, `CHECKOUT_PAGE_VIEW`, `CHECKOUT_REGISTRATION_SUCCESS`
  - Step constants: `STEP_PLAN_DETAILS`, `STEP_ACCOUNT_DETAILS`, `STEP_REGISTRATION`
  - Field name constants for all tracked fields
  - Plan type constant

#### Phase 2: Step 1 Field Tracking (Plan Details) - In Progress
- ✅ **Task 2.1**: Instrumented LicensesField (quantity)
  - File: `src/components/FormFields/LicensesField.tsx`
  - Added useFieldTracking hook integration
  - Gets checkoutIntentId from useBFFContext hook
  - Properties: `{ step: 'plan_details', field_name: 'numLicenses', plan_type: 'teams' }`
  - Fixed import order lint issues in tracking hooks

- ✅ **Task 2.2**: Instrumented NameAndEmailFields
  - File: `src/components/FormFields/NameAndEmailFields.tsx`
  - Added tracking for fullName field: `field_name: 'fullName'`
  - Added tracking for adminEmail field: `field_name: 'adminEmail'`
  - Added tracking for country field: `field_name: 'country'`
  - All fields use `step: 'plan_details'` and `plan_type: 'teams'`
  - Fixed import order (parent directory before subdirectory imports)

- ✅ **Task 2.3**: Added page view tracking for Plan Details
  - File: `src/components/plan-details-pages/PlanDetailsPage.tsx`
  - Added useEffect to fire page view event on component mount
  - Event: `CHECKOUT_PAGE_VIEW` with properties `{ step: 'plan_details', plan_type: 'teams' }`
  - Integrated useBFFContext to get checkoutIntentId
  - Added error handling with logError for tracking failures
  - useEffect depends on checkoutIntentId to re-fire if it changes

#### Phase 2: Step 1 Field Tracking (Plan Details) ✅ COMPLETE

#### Phase 3: Step 2 Field Tracking (Registration/Account Details) - In Progress
- ✅ **Task 3.1**: Instrumented RegisterAccountFields (username, password)
  - File: `src/components/FormFields/RegisterAccountFields.tsx`
  - Added tracking to RegisterAccountUsername component: `field_name: 'username'`
  - Added tracking to RegisterAccountPassword component: `field_name: 'password'`
  - **CRITICAL SECURITY**: Password tracking uses `interaction: 'blur'` property - NEVER logs password value
  - Both fields use `step: 'registration'` and `plan_type: 'teams'`
  - Integrated useBFFContext in both components for checkoutIntentId

- ✅ **Task 3.2**: Instrumented CompanyNameField
  - File: `src/components/FormFields/CompanyNameField.tsx`
  - Added tracking for companyName field: `field_name: 'companyName'`
  - Uses `step: 'account_details'` and `plan_type: 'teams'`
  - Integrated useBFFContext for checkoutIntentId

- ✅ **Task 3.3**: Instrumented CustomUrlField with debouncing
  - File: `src/components/FormFields/CustomUrlField.tsx`
  - Used useDebounceTracking hook (500ms delay)
  - Field name: `urlSlug` (tracks the enterpriseSlug field)
  - Uses `step: 'account_details'` and `plan_type: 'teams'`
  - Includes `org_slug` property with the current field value
  - Uses form.watch() to get current enterpriseSlug value for tracking
  - Integrated useBFFContext for checkoutIntentId

- ✅ **Task 3.4**: Added page view tracking for Registration
  - File: `src/components/Stepper/StepperContent/PlanDetailsRegisterContent.tsx`
  - Converted from functional component to component with hooks
  - Added useEffect to fire page view event on mount
  - Event: `CHECKOUT_PAGE_VIEW` with `{ step: 'registration', plan_type: 'teams' }`
  - Integrated useBFFContext for checkoutIntentId
  - Added error handling with logError
  - useEffect depends on checkoutIntentId to re-fire if it changes

---

### 🔄 Current Sprint

#### Phase 0: Setup
- [ ] **Task 0.1**: Create and checkout feature branch `feat/ssp-telemetry-frontend`
- [ ] **Task 0.2**: Verify branch matches PRD specification

#### Phase 1: Core Tracking Infrastructure
- [ ] **Task 1.1**: Create `src/hooks/useFieldTracking.ts`
  - Implement custom hook that wraps field blur events with tracking
  - Accept parameters: `fieldName`, `step`, `checkoutIntentId`
  - Use `sendEnterpriseCheckoutTrackingEvent` from `src/utils/common.ts`
  - Include try/catch with `logError()` for error handling
  - Return onBlur handler function

- [ ] **Task 1.2**: Create `src/hooks/useDebounceTracking.ts`
  - For URL/slug field debouncing (300-500ms delay)
  - Same error handling pattern as useFieldTracking

- [ ] **Task 1.3**: Add tracking event constants in `src/constants/tracking.ts`
  - Event names: `CHECKOUT_FIELD_BLUR`, `CHECKOUT_PAGE_VIEW`, `CHECKOUT_REGISTRATION_SUCCESS`
  - Step constants: `STEP_PLAN_DETAILS`, `STEP_ACCOUNT_DETAILS`, `STEP_REGISTRATION`

#### Phase 2: Step 1 Field Tracking (Plan Details)
- [ ] **Task 2.1**: Instrument LicensesField (quantity)
  - File: `src/components/FormFields/LicensesField.tsx`
  - Add useFieldTracking hook
  - Get checkoutIntentId from queryBffContext
  - Properties: `{ step: 'plan_details', field_name: 'numLicenses', plan_type: 'teams' }`

- [ ] **Task 2.2**: Instrument NameAndEmailFields
  - File: `src/components/FormFields/NameAndEmailFields.tsx`
  - Track fullName: `field_name: 'fullName'`
  - Track adminEmail: `field_name: 'adminEmail'`
  - Track country: `field_name: 'country'`
  - All use `step: 'plan_details'`

- [ ] **Task 2.3**: Add page view tracking for Plan Details
  - File: `src/components/plan-details-pages/PlanDetailsPage.tsx`
  - useEffect to fire page view event on mount
  - Event: `CHECKOUT_PAGE_VIEW` with `{ step: 'plan_details', plan_type: 'teams' }`

#### Phase 3: Step 2 Field Tracking (Registration/Account Details)
- [ ] **Task 3.1**: Instrument RegisterAccountFields (username, password)
  - File: `src/components/FormFields/RegisterAccountFields.tsx`
  - Track username in RegisterAccountUsername component
  - Track password in RegisterAccountPassword component
  - **CRITICAL**: Password tracking - interaction only, never value
  - Properties: `{ step: 'registration', field_name: 'password', interaction: 'blur' }`

- [ ] **Task 3.2**: Instrument CompanyNameField
  - File: `src/components/FormFields/CompanyNameField.tsx`
  - Properties: `{ step: 'account_details', field_name: 'companyName', plan_type: 'teams' }`

- [ ] **Task 3.3**: Instrument CustomUrlField with debouncing
  - File: `src/components/FormFields/CustomUrlField.tsx`
  - Use useDebounceTracking hook
  - Properties: `{ step: 'account_details', field_name: 'urlSlug', plan_type: 'teams', org_slug: value }`

- [ ] **Task 3.4**: Add page view tracking for Registration
  - File: `src/components/Stepper/StepperContent/PlanDetailsRegisterContent.tsx`
  - useEffect to fire page view event on mount
  - Event: `CHECKOUT_PAGE_VIEW` with `{ step: 'registration', plan_type: 'teams' }`

- [ ] **Task 3.5**: Add success event for registration submission
  - File: `src/components/plan-details-pages/PlanDetailsPage.tsx` or submit handler
  - Fire event on successful form submission
  - Event: `CHECKOUT_REGISTRATION_SUCCESS` with `{ step: 'registration', plan_type: 'teams' }`

#### Phase 4: Testing
- [ ] **Task 4.1**: Write unit tests for `src/hooks/tests/useFieldTracking.test.ts`
  - Mock `@edx/frontend-platform/analytics` sendTrackEvent
  - Test blur event triggers tracking
  - Test error handling with logError
  - Test properties are correctly passed

- [ ] **Task 4.2**: Write unit tests for `src/hooks/tests/useDebounceTracking.test.ts`
  - Test debouncing behavior (use jest.useFakeTimers)
  - Verify events are not fired too frequently

- [ ] **Task 4.3**: Update field component tests
  - Mock tracking hooks
  - Verify tracking is called on blur with correct parameters
  - Verify password tracking never logs value
  - Files to update:
    - `src/components/FormFields/tests/LicensesField.test.tsx`
    - `src/components/FormFields/tests/NameAndEmailFields.test.tsx`
    - `src/components/FormFields/tests/RegisterAccountFields.test.tsx`
    - `src/components/FormFields/tests/CompanyNameField.test.tsx`
    - `src/components/FormFields/tests/CustomUrlField.test.tsx`

- [ ] **Task 4.4**: Integration tests for page view events
  - Update page-level tests to verify page view events fire
  - Mock analytics module
  - Verify event properties

#### Phase 5: Quality Assurance
- [ ] **Task 5.1**: Run lint and fix issues (`npm run lint:fix`)
- [ ] **Task 5.2**: Run type checking (`npm run check-types`)
- [ ] **Task 5.3**: Run full test suite (`npm test`) - ensure 80%+ coverage
- [ ] **Task 5.4**: Manual verification
  - Verify tracking events in browser devtools
  - Test all fields fire blur events correctly
  - Verify password value is never transmitted

#### Phase 6: Documentation & Commit
- [ ] **Task 6.1**: Create `docs/references/ssp-checkout-telemetry-frontend.md`
  - Document tracking strategy and events
  - Field mappings
  - Hook usage patterns
  - Testing approach
  - Learnings and gotchas

- [ ] **Task 6.2**: Commit changes
  - Run pre-commit checks
  - Message: `feat: SSP-TELEMETRY-FE - Add Segment-based event tracking for SSP Checkout Frontend`

- [ ] **Task 6.3**: Update `.ralph/specs/ssp-checkout-telemetry-frontend.json`
  - Set `"passes": true`

---

## Key Technical Notes

### Accessing Checkout Intent ID
- Use `queryBffContext` query in components (see `PlanDetailsPage.tsx` for reference)
- Pattern:
  ```typescript
  const { data: contextMetadata } = useQuery(queryBffContext(authenticatedUser?.userId || null));
  const checkoutIntentId = contextMetadata?.checkoutIntent?.id || null;
  ```

### Error Handling Pattern
```typescript
try {
  sendEnterpriseCheckoutTrackingEvent({
    checkoutIntentId,
    eventName: 'checkout.field.blur',
    properties: { ... }
  });
} catch (error) {
  logError('Failed to send tracking event', error);
}
```

### Password Security
- **NEVER** log or transmit password values
- Only track interaction events (blur/focus)
- Example: `{ field_name: 'password', interaction: 'blur' }` ✅
- Example: `{ field_name: 'password', value: '...' }` ❌

### Debouncing
- Apply only to `urlSlug` field
- Delay: 300-500ms
- Use lodash.debounce or custom implementation

### Event Properties Standard
All field blur events should include:
- `checkoutIntentId`: number | null
- `step`: 'plan_details' | 'registration' | 'account_details'
- `field_name`: string
- `plan_type`: 'teams'
- `org_slug`: string (where available, e.g., in account_details step)
- `user_id`: number (where available)

---

## Learnings & Institutional Memory

### Architecture Patterns Discovered
1. **Tracking Infrastructure**: The project already has `sendEnterpriseCheckoutTrackingEvent` utility in `src/utils/common.ts` that wraps Segment's `sendTrackEvent` with checkout-specific context.
2. **Constants Pattern**: Existing `src/constants/events.ts` follows a hierarchical naming pattern. Created new `tracking.ts` for tracking-specific constants.
3. **Hook Pattern**: Custom hooks in `src/hooks/` follow simple, focused patterns with TypeScript interfaces for parameters.

### Challenges & Solutions
1. **Debouncing Implementation**: Used `useRef` for timeout management with proper cleanup on unmount to prevent memory leaks.
2. **TypeScript Compatibility**: Used `NodeJS.Timeout` type for timeout ref in useDebounceTracking hook.
3. **Import Order Linting**: ESLint requires external imports (@edx) before React imports. Fixed by reordering imports.
4. **Arrow Function Body**: ESLint prefers implicit returns in arrow functions when possible. Fixed useEffect cleanup.
5. **Password Security**: For password field tracking, added explicit `interaction: 'blur'` property to clearly indicate interaction-only tracking. The useFieldTracking hook never receives or logs the password value.

### Test Patterns & Best Practices
_(To be filled in during testing phase)_

### PRD Clarifications
1. The PRD mentions `org_slug` which maps to the `urlSlug` field in the codebase (used in Step 2: Account Details).
2. The `sendEnterpriseCheckoutTrackingEvent` already handles `checkoutIntentId` injection, simplifying our tracking hooks.
3. **BFF Context Access**: Use `useBFFContext(userId)` hook to access checkout context. The checkoutIntentId is at `bffContext?.checkoutIntent?.id`.
4. **Field Component Props**: The Field component accepts additional props via spread operator, making it easy to add onBlur handlers.
5. **Dynamic Property Values**: Use `form.watch('fieldName')` to get current field values for tracking properties (e.g., org_slug). This ensures the tracking event includes the most up-to-date value.

---

## Success Criteria
- ✅ All field blur events tracked with correct properties
- ✅ Page view events fire on registration step entry
- ✅ Success event fires on registration completion
- ✅ Password interaction tracked without value
- ✅ URL/slug field debounced
- ✅ All tests pass with 80%+ coverage
- ✅ No lint or type errors
- ✅ Documentation complete

---

## Estimated Effort
- Phase 1-3 (Implementation): 3-4 hours
- Phase 4 (Testing): 2-3 hours
- Phase 5-6 (QA & Docs): 1-2 hours
- **Total**: 6-9 hours

---

## References
- PRD: `.ralph/telemetry-tracking-prd.md`
- Spec: `.ralph/specs/ssp-checkout-telemetry-frontend.json`
- Architecture: `CLAUDE.md`
- Analytics utility: `src/utils/common.ts` (sendEnterpriseCheckoutTrackingEvent)
- Form fields: `src/components/FormFields/`
