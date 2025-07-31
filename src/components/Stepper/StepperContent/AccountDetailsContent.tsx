import {
  CustomUrlField,
  OrganizationNameField,
} from '@/components/FormFields';
import { PriceAlert } from '@/components/PriceAlert';

const AccountDetailsContent = () => (
  <>
    <PriceAlert />
    <OrganizationNameField />
    <CustomUrlField />
  </>
);

export default AccountDetailsContent;
