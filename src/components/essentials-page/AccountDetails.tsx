import { AccountDetailsPage } from '@/components/account-details-page';

// Essentials wrapper that reuses the Teams (Checkout) form as-is.
const EssentialsAccountDetails = () => (
  <div className="essentials-account-details-wrapper">
    <AccountDetailsPage />
  </div>
);

export default EssentialsAccountDetails;
