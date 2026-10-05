# Checkout Segment Events (v2) — Event Dictionary

Normalized checkout funnel events added in ENT-12328. They run **alongside** the legacy
`edx.ui.enterprise.checkout.self_service_subscription_checkout.*` events (see
[ssp-checkout-telemetry-frontend.md](./ssp-checkout-telemetry-frontend.md)); nothing legacy is removed.

**Feature flag:** `FEATURE_SSP_CHECKOUT_SEGMENT_EVENTS_V2` (`'true'` enables). When the flag is off,
no v2 event is sent and `checkout_started` is not claimed for the session.

## Where things live

| Concern | Location |
| --- | --- |
| Event names, step name/number pairs | `src/constants/events.ts` (`EVENT_NAMES.CHECKOUT`, `CHECKOUT_EVENT_STEPS`) |
| Flag check, payload building, attribution, emission | `src/utils/checkoutEvents.ts` |
| Product properties from BFF pricing + form store | `src/components/app/data/hooks/useCheckoutEventProductProperties.tsx` |
| `checkout_step_viewed.*` / `checkout_started` | `src/components/app/data/hooks/useTrackCheckoutStepViewed.tsx` |
| Attribution capture (UTM + referrer) | `rootLoader` → `captureCheckoutAttribution(request.url)` |

## Events

| Event | Trigger | Emitted from | Properties |
| --- | --- | --- | --- |
| `edx.ui.enterprise.checkout.checkout_started` | First view of step 1 in a browser session; does not re-fire on back navigation | `PlanDetailsPage` (via `useTrackCheckoutStepViewed`, `isEntryStep`) | product, step, attribution |
| `edx.ui.enterprise.checkout.checkout_step_viewed.plan_details` | Every visit to step 1 (main page, not login/register substeps) | `PlanDetailsPage` | product, step, attribution |
| `edx.ui.enterprise.checkout.checkout_step_completed.plan_details` | Checkout intent created successfully (user advances to step 2) | `PlanDetailsPage` → `createCheckoutIntentMutation.onSuccess` | product, step, attribution |
| `edx.ui.enterprise.checkout.checkout_step_viewed.account_details` | Every visit to step 2 | `AccountDetailsPage` | product, step, attribution |
| `edx.ui.enterprise.checkout.checkout_step_completed.account_details` | Checkout session created (or already created) and user advances to step 3 | `AccountDetailsPage` | product, step, attribution |
| `edx.ui.enterprise.checkout.checkout_step_viewed.billing_details` | Every visit to step 3 (not the success substep) | `BillingDetailsPage` | product, step, attribution |
| `edx.ui.enterprise.checkout.checkout_step_completed.billing_details` | Stripe `confirm()` succeeds and session is `complete` / `paid`; or, after a Stripe redirect, the success route loads with a `paid`/`fulfilled` intent for a payment submitted in this tab | `BillingDetailsPage` via `StatefulSubscribeButton` `onPaymentSuccess`; fallback in `BillingDetailsSuccessContent` | product, step, order, attribution |
| `edx.ui.enterprise.checkout.account_created` | Registration succeeds in the logistration substep | `PlanDetailsPage` → `registerMutation.onSuccess` | product, attribution |
| `edx.ui.enterprise.checkout.login_started` | Every visit to the login substep | `PlanDetailsPage` | product, attribution |
| `edx.ui.enterprise.checkout.signed_in` | Login succeeds in the logistration substep | `PlanDetailsPage` → `loginMutation.onSuccess` | product, attribution |
| `edx.ui.enterprise.checkout.order_completed` | Stripe confirmed payment | **Server-side (enterprise-access)**, not this MFE | product, order |
| `edx.ui.enterprise.checkout.order_cancelled` | Signature-verified Stripe subscription-cancellation webhook | **Server-side (enterprise-access)**, not this MFE | product, order |

"Every visit" is keyed on the React Router location key: back/forward navigation counts as a new
view, re-renders of the same visit do not.

## Properties

A property that doesn't apply or isn't available is **omitted**, never sent as `''` or `null`.

### Product (all events)

| Property | Source | Example |
| --- | --- | --- |
| `product_id` | `pricing.prices[].product` (Stripe product ID) | `prod_abc123` |
| `sku` | `pricing.prices[].catalogQueryId` — **omitted until the BFF returns it** | `42` |
| `category` | constant | `subscription` |
| `name` | `teams` or `essentials` (from the Essentials session flag) | `essentials` |
| `brand` | constant | `enterprise` |
| `variant` | academy name (`AcademySelection.selectedProduct.name`); Essentials only | `AI Academy` |
| `price` | `unitAmount / 100` of the matched price | `149` |
| `slug` | `sspProductSlug` from the store, falling back to the price's `sspProductSlug` | `ai-academy-yearly` |
| `payment_schedule` | Stripe `recurring.interval` → `yearly` / `monthly` | `yearly` |

### Step (step events)

| Step | `step_name` | `step_number` |
| --- | --- | --- |
| Plan Details | `Plan Details` | `1` |
| Account Details | `Account Details` | `2` |
| Billing Details | `Billing Details` | `3` |

### Order (`checkout_step_completed.billing_details`)

| Property | Source |
| --- | --- |
| `order_id` | Stripe checkout session ID from the `confirm()` result, falling back to `checkoutIntent.stripeCheckoutSessionId` |
| `total_quantity` | `checkoutIntent.quantity`, falling back to the Plan Details quantity |
| `revenue` | `session.total.total.minorUnitsAmount / session.minorUnitsAmountDivisor` (the amount Stripe charged, not price × quantity) |
| `payment_method` | Not retrievable client-side at emission time, so omitted |

Stripe's `confirm({ redirect: 'if_required' })` can redirect to the success route (for example, for 3-D Secure),
so the billing page's in-page handler never runs. To cover that case, `StatefulSubscribeButton` calls
`onPaymentSubmit` before `confirm()`, which records the checkout intent in
`sessionStorage['edx.checkout.payment_submitted']`. The success route then emits the event for that intent.
Both paths share `claimBillingStepCompleted(uuid)`, so the event is sent once per checkout intent per session.
A success-page revisit or refresh without a payment submitted in this tab sends nothing.
On the redirect path, `revenue` is omitted because the Stripe session total isn't available there.

### Attribution (all frontend events)

`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `referrer`.

Captured by `rootLoader` into `sessionStorage['edx.checkout.attribution']`. The first landing in a
session wins; a later URL replaces it only if that URL carries its own UTM parameters (a new campaign
link). Values persist across steps and the logistration flow.

## Example payload

```json
{
  "product_id": "prod_abc123",
  "category": "subscription",
  "name": "essentials",
  "brand": "enterprise",
  "variant": "AI Academy",
  "price": 149,
  "slug": "ai-academy-yearly",
  "payment_schedule": "yearly",
  "step_name": "Billing Details",
  "step_number": 3,
  "order_id": "cs_test_a1b2c3",
  "total_quantity": 5,
  "revenue": 745,
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "teams_q3",
  "referrer": "https://www.google.com/"
}
```

## Privacy and reliability

- No email, name, billing address or payment credential is ever added to a v2 event. Identity goes
  only through the existing Segment `identify` call and anonymous ID.
- `sendCheckoutEvent` wraps emission in try/catch; storage access is guarded too. A blocked or
  failed call is logged and never surfaces an error, blocks a step transition, or blocks payment.

## Not covered by this MFE

- `order_completed` / `order_cancelled`, including their per-`order_id` idempotency. These belong to enterprise-access.
- `sku`: the BFF pricing payload needs to return `catalog_query_id`.
- Registering typed schemas in the Segment tracking plan and routing violation alerts.
- End-to-end verification in stage (Teams, Essentials and an academy variant) before enabling the flag in production.
